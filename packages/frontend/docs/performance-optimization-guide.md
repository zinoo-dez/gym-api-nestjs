# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Gym Management Frontend application.

## Table of Contents

1. [Code Splitting](#code-splitting)
2. [Bundle Analysis](#bundle-analysis)
3. [React.memo Optimization](#reactmemo-optimization)
4. [TanStack Query Cache Optimization](#tanstack-query-cache-optimization)
5. [Image Lazy Loading](#image-lazy-loading)
6. [Best Practices](#best-practices)

## Code Splitting

### Implementation

The application uses React.lazy() and Suspense for route-based code splitting. This ensures that only the code needed for the current route is loaded, reducing the initial bundle size.

**Location:** `src/routes/index.jsx`

### Routes Split

- **Eagerly Loaded:**
  - Login/Register pages (entry points)
  - Dashboard (default protected route)
  - MainLayout and ProtectedRoute (core infrastructure)

- **Lazy Loaded:**
  - All member management pages
  - All trainer management pages
  - All class management pages
  - All membership pages
  - All attendance pages
  - All workout pages
  - 404 Not Found page

### Suspense Fallback

A loading spinner is displayed while lazy-loaded components are being fetched:

```jsx
<Suspense
  fallback={
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="large" />
    </div>
  }
>
  <Outlet />
</Suspense>
```

**Location:** `src/components/layout/MainLayout.jsx`

## Bundle Analysis

### Visualizer Plugin

The application uses `rollup-plugin-visualizer` to analyze bundle size and composition.

**Configuration:** `vite.config.js`

### Running Bundle Analysis

```bash
npm run build
```

After building, open `dist/stats.html` to view:

- Bundle size breakdown
- Chunk composition
- Gzip and Brotli compressed sizes
- Module dependencies

### Manual Chunks

Vendor libraries are split into separate chunks for better caching:

```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'query-vendor': ['@tanstack/react-query'],
  'form-vendor': ['zod'],
  'ui-vendor': ['framer-motion'],
}
```

This ensures that:

- Vendor code is cached separately from application code
- Updates to application code don't invalidate vendor cache
- Common libraries are shared across routes

## React.memo Optimization

### Components Optimized

All reusable components have been wrapped with `React.memo()` to prevent unnecessary re-renders:

**Common Components:**

- `Button` - Prevents re-render when parent updates
- `Input` - Prevents re-render when sibling inputs change
- `Table` - Prevents re-render when data hasn't changed
- `Pagination` - Prevents re-render when page data is stable
- `Modal` - Prevents re-render when not visible
- `LoadingSpinner` - Prevents re-render when size/className unchanged
- `Toast` - Prevents re-render for individual toast items
- `ToastContainer` - Prevents re-render when toast list unchanged

**Form Components:**

- `MemberForm` - Prevents re-render when parent state changes
- `TrainerForm` - Prevents re-render when parent state changes
- `ClassForm` - Prevents re-render when parent state changes
- `MembershipForm` - Prevents re-render when parent state changes
- `WorkoutForm` - Prevents re-render when parent state changes

### When React.memo Helps

React.memo is most effective when:

1. Component receives the same props frequently
2. Component is expensive to render
3. Component is rendered often (e.g., in lists)
4. Props are primitive values or stable references

### When NOT to Use React.memo

Avoid React.memo when:

1. Props change on every render
2. Component is cheap to render
3. Component rarely re-renders
4. Premature optimization without profiling

## TanStack Query Cache Optimization

### Default Cache Settings

**Location:** `src/App.jsx`

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false, // Disabled for better UX
      refetchOnReconnect: true, // Enabled for data freshness
      retry: 1, // Retry once on failure
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### Usage-Based Cache Strategies

The application exports three cache strategy presets:

#### 1. Frequent Query Options (Frequently Changing Data)

```javascript
export const frequentQueryOptions = {
  staleTime: 1 * 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
};
```

**Use for:**

- Attendance records
- Class bookings
- Real-time availability

**Example:**

```javascript
export function useAttendance(params) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => attendanceApi.getAll(params),
    ...frequentQueryOptions,
  });
}
```

#### 2. Rare Query Options (Rarely Changing Data)

```javascript
export const rareQueryOptions = {
  staleTime: 15 * 60 * 1000, // 15 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
};
```

**Use for:**

- Membership plans
- Trainer profiles
- Gym configuration

**Example:**

```javascript
export function useMemberships() {
  return useQuery({
    queryKey: ["memberships"],
    queryFn: membershipApi.getAll,
    ...rareQueryOptions,
  });
}
```

#### 3. Static Query Options (Static/Reference Data)

```javascript
export const staticQueryOptions = {
  staleTime: 60 * 60 * 1000, // 1 hour
  gcTime: 24 * 60 * 60 * 1000, // 24 hours
};
```

**Use for:**

- Application configuration
- Static reference data
- Rarely updated settings

### Cache Invalidation

All mutations properly invalidate related queries:

```javascript
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: memberApi.create,
    onSuccess: () => {
      // Invalidate list query to refetch
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
```

### Optimistic Updates

For better UX, consider implementing optimistic updates for mutations:

```javascript
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => memberApi.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["members", id] });

      // Snapshot previous value
      const previousMember = queryClient.getQueryData(["members", id]);

      // Optimistically update
      queryClient.setQueryData(["members", id], data);

      return { previousMember };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ["members", variables.id],
        context.previousMember,
      );
    },
    onSettled: (_, __, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
    },
  });
}
```

## Image Lazy Loading

### Native Lazy Loading

For any images added to the application, use the native `loading="lazy"` attribute:

```jsx
<img
  src="/path/to/image.jpg"
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>
```

### Benefits

- Images are only loaded when they're about to enter the viewport
- Reduces initial page load time
- Saves bandwidth for users
- Improves Core Web Vitals (LCP, CLS)

### Browser Support

Native lazy loading is supported in all modern browsers. For older browsers, images will load normally.

## Best Practices

### 1. Measure Before Optimizing

Use browser DevTools to identify performance bottlenecks:

- **Performance tab:** Record and analyze runtime performance
- **Network tab:** Identify slow requests and large assets
- **Lighthouse:** Get automated performance recommendations

### 2. Monitor Bundle Size

Run bundle analysis regularly:

```bash
npm run build
```

Keep an eye on:

- Total bundle size
- Individual chunk sizes
- Vendor vs. application code ratio

### 3. Avoid Premature Optimization

Focus on:

1. User-facing performance issues first
2. Bottlenecks identified through profiling
3. High-impact, low-effort optimizations

### 4. Use Production Builds

Always test performance with production builds:

```bash
npm run build
npm run preview
```

Development builds include debugging tools that slow down the application.

### 5. Cache Invalidation Strategy

- Invalidate specific queries, not all queries
- Use query keys consistently
- Consider optimistic updates for better UX

### 6. Code Splitting Strategy

- Split by route (already implemented)
- Consider splitting large components
- Don't over-split (too many chunks can hurt performance)

### 7. React.memo Guidelines

- Profile before adding memo
- Use memo for expensive components
- Ensure props are stable (use useCallback/useMemo for functions/objects)

### 8. TanStack Query Best Practices

- Set appropriate staleTime based on data volatility
- Use background refetching for better UX
- Implement proper error handling
- Consider prefetching for predictable navigation

## Performance Metrics

### Target Metrics

- **First Contentful Paint (FCP):** < 1.8s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.8s
- **Total Blocking Time (TBT):** < 200ms
- **Cumulative Layout Shift (CLS):** < 0.1

### Monitoring

Use Lighthouse in Chrome DevTools to measure:

```bash
# Run Lighthouse audit
1. Open Chrome DevTools (F12)
2. Go to Lighthouse tab
3. Select "Performance" category
4. Click "Analyze page load"
```

## Future Optimizations

### Potential Improvements

1. **Service Worker:** Implement offline support and caching
2. **Prefetching:** Prefetch likely next routes on hover
3. **Virtual Scrolling:** For large lists (members, classes)
4. **Image Optimization:** Use WebP format with fallbacks
5. **CDN:** Serve static assets from CDN
6. **Compression:** Enable Brotli compression on server
7. **HTTP/2:** Use HTTP/2 for multiplexing
8. **Tree Shaking:** Ensure unused code is eliminated

### Monitoring Tools

Consider integrating:

- **Web Vitals:** Real user monitoring
- **Sentry:** Error tracking and performance monitoring
- **Google Analytics:** User behavior and performance
- **Vercel Analytics:** If deployed on Vercel

## Conclusion

The application has been optimized for performance through:

- ✅ Route-based code splitting
- ✅ Bundle analysis tooling
- ✅ React.memo for component optimization
- ✅ TanStack Query cache optimization
- ✅ Image lazy loading support

Continue monitoring performance metrics and optimize based on real-world usage patterns.
