# Performance Optimization Guide

This document describes the performance optimizations implemented in the Gym Management Frontend application.

## Overview

The application has been optimized for performance through several key strategies:

1. **Code Splitting** - Route-based lazy loading to reduce initial bundle size
2. **React.memo** - Preventing unnecessary re-renders of pure components
3. **TanStack Query Optimization** - Fine-tuned cache settings based on data change frequency
4. **Image Lazy Loading** - Native browser lazy loading for images

## 1. Code Splitting with React.lazy

### Implementation

All route components are lazy-loaded using React.lazy and Suspense, except for:

- Authentication pages (LoginPage, RegisterPage) - loaded eagerly as entry points
- Dashboard - loaded eagerly as the default protected route

### Benefits

- **Reduced Initial Bundle Size**: Users only download code for the routes they visit
- **Faster Initial Load**: Smaller initial JavaScript bundle means faster time to interactive
- **Better Caching**: Route chunks can be cached independently

### Files Modified

- `src/routes/index.jsx` - Converted all route imports to lazy imports
- `src/components/layout/MainLayout.jsx` - Added Suspense wrapper with loading fallback

### Example

```javascript
// Before (eager loading)
import { MembersListPage } from "../pages/members/MembersListPage.jsx";

// After (lazy loading)
const MembersListPage = lazy(() =>
  import("../pages/members/MembersListPage.jsx").then((module) => ({
    default: module.MembersListPage,
  })),
);
```

### Lazy-Loaded Routes

The following route groups are lazy-loaded:

- **Members**: List, Create, Detail, Edit (4 chunks)
- **Trainers**: List, Create, Detail, Edit (4 chunks)
- **Classes**: Schedule, Create, Detail, Edit (4 chunks)
- **Memberships**: Management page (1 chunk)
- **Attendance**: Tracking page (1 chunk)
- **Workouts**: List, Create, Detail, Edit (4 chunks)
- **Error**: 404 page (1 chunk)

**Total**: 19 lazy-loaded route chunks

## 2. React.memo Optimization

### Implementation

Applied React.memo to frequently rendered pure components that don't need to re-render when parent components update.

### Components Optimized

1. **Button** (`src/components/common/Button.jsx`)
   - Prevents re-renders when parent state changes
   - Only re-renders when props (onClick, isLoading, etc.) change

2. **Input** (`src/components/common/Input.jsx`)
   - Prevents re-renders in forms with multiple inputs
   - Only re-renders when its specific value or error changes

3. **Table** (`src/components/common/Table.jsx`)
   - Prevents re-renders when parent state changes
   - Only re-renders when data, columns, or loading state changes

4. **Pagination** (`src/components/common/Table.jsx`)
   - Prevents re-renders when table data changes
   - Only re-renders when page, totalPages, or pageSize changes

### Benefits

- **Reduced Re-renders**: Components only re-render when their props actually change
- **Better Performance**: Especially noticeable in forms with many inputs and tables with many rows
- **Smoother UI**: Less work for React's reconciliation algorithm

### When NOT to Use React.memo

- Components that always receive new props (e.g., inline functions, new objects)
- Components that render infrequently
- Components with complex prop comparison needs (would need custom comparison function)

## 3. TanStack Query Cache Optimization

### Strategy

Different data types have different change frequencies. We've optimized cache settings accordingly:

#### Frequently Changing Data (1-2 minute stale time)

- **Attendance Records**: `staleTime: 1 minute, gcTime: 5 minutes`
  - Changes constantly as members check in/out
  - Hooks: `useAttendance`, `useAttendanceRecord`, `useAttendanceStatistics`

- **Class Schedules & Bookings**: `staleTime: 2 minutes, gcTime: 10 minutes`
  - Changes frequently as members book/cancel classes
  - Hooks: `useClasses`, `useClass`, `useClassBookings`

#### Moderately Changing Data (5 minute stale time - default)

- **Members**: Default settings
- **Trainers**: Default settings
- **Workouts**: Default settings

#### Rarely Changing Data (15 minute stale time)

- **Membership Plans**: `staleTime: 15 minutes, gcTime: 30 minutes`
  - Plans are configured infrequently
  - Hooks: `useMemberships`, `useMembership`

### Configuration

```javascript
// Default settings (App.jsx)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Benefits

- **Reduced API Calls**: Data is cached longer when it changes infrequently
- **Better UX**: Instant data display from cache while revalidating in background
- **Lower Server Load**: Fewer unnecessary API requests
- **Optimistic Updates**: Immediate UI feedback for mutations

### Files Modified

- `src/App.jsx` - Enhanced query client configuration with retry logic
- `src/hooks/useAttendance.js` - Added frequent data cache settings
- `src/hooks/useClasses.js` - Added frequent data cache settings
- `src/hooks/useMemberships.js` - Added rare data cache settings

## 4. Image Lazy Loading

### Implementation

All images should use the native `loading="lazy"` attribute for automatic lazy loading:

```jsx
<img src="/path/to/image.jpg" alt="Description" loading="lazy" />
```

### Benefits

- **Faster Initial Load**: Images below the fold aren't loaded until needed
- **Reduced Bandwidth**: Users don't download images they never see
- **Better Performance**: Browser handles lazy loading natively (no JavaScript overhead)

### Browser Support

- Supported in all modern browsers (Chrome 77+, Firefox 75+, Safari 15.4+, Edge 79+)
- Gracefully degrades in older browsers (images load normally)

## Performance Metrics

### Expected Improvements

1. **Initial Bundle Size**: ~30-40% reduction due to code splitting
2. **Time to Interactive**: ~20-30% improvement for initial page load
3. **Re-render Count**: ~40-50% reduction in unnecessary re-renders
4. **API Request Count**: ~25-35% reduction due to optimized caching

### Measuring Performance

Use these tools to measure performance:

1. **Vite Build Analyzer**:

   ```bash
   npm run build
   # Check dist/assets/ for chunk sizes
   ```

2. **Chrome DevTools**:
   - Network tab: Monitor bundle sizes and load times
   - Performance tab: Record and analyze runtime performance
   - React DevTools Profiler: Measure component render times

3. **Lighthouse**:
   ```bash
   npm run build
   npm run preview
   # Run Lighthouse audit in Chrome DevTools
   ```

## Bundle Analysis

To analyze the bundle size and identify optimization opportunities:

```bash
# Install rollup-plugin-visualizer (if not already installed)
npm install --save-dev rollup-plugin-visualizer

# Build with analysis
npm run build

# Open stats.html in browser to see bundle visualization
```

## Best Practices

### Code Splitting

- ✅ Split by route (already implemented)
- ✅ Keep authentication and dashboard eager-loaded
- ⚠️ Consider splitting large form components if they exceed 50KB
- ⚠️ Consider splitting large third-party libraries (e.g., chart libraries)

### React.memo

- ✅ Use for pure presentational components
- ✅ Use for components rendered in lists
- ❌ Don't use for components that always receive new props
- ❌ Don't use for components that render infrequently

### TanStack Query

- ✅ Set staleTime based on data change frequency
- ✅ Use optimistic updates for better UX
- ✅ Invalidate related queries after mutations
- ❌ Don't set staleTime too high for frequently changing data
- ❌ Don't disable caching unless absolutely necessary

### Images

- ✅ Always use `loading="lazy"` for images below the fold
- ✅ Use appropriate image formats (WebP with fallbacks)
- ✅ Optimize image sizes (use responsive images)
- ❌ Don't lazy-load above-the-fold images

## Future Optimization Opportunities

1. **Component-Level Code Splitting**: Split large form components
2. **Virtual Scrolling**: For long lists (members, classes, attendance)
3. **Service Worker**: For offline support and faster repeat visits
4. **Prefetching**: Prefetch likely next routes on hover
5. **Image Optimization**: Use next-gen formats (WebP, AVIF)
6. **Tree Shaking**: Ensure unused code is eliminated
7. **CSS Optimization**: Consider CSS-in-JS or CSS modules for better tree shaking

## Monitoring

### Production Monitoring

Consider implementing:

- **Real User Monitoring (RUM)**: Track actual user performance
- **Error Tracking**: Monitor performance-related errors
- **Bundle Size Tracking**: Alert on bundle size increases
- **Core Web Vitals**: Track LCP, FID, CLS metrics

### Development Monitoring

- Use React DevTools Profiler during development
- Monitor bundle size on each build
- Run Lighthouse audits before releases
- Test on slow networks and devices

## Conclusion

These optimizations provide a solid foundation for application performance. Continue monitoring and optimizing based on real-world usage patterns and user feedback.
