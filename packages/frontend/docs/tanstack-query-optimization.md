# TanStack Query Optimization Guide

## Overview

This document describes the TanStack Query optimization strategies implemented in the Gym Management Frontend application to provide optimal performance and user experience.

## Query Client Configuration

The query client is configured with optimal settings in `src/App.jsx`:

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      retry: 1, // Retry failed requests once
    },
  },
});
```

### Configuration Details

- **staleTime (5 minutes)**: Data is considered fresh for 5 minutes, preventing unnecessary refetches
- **gcTime (10 minutes)**: Cached data is kept in memory for 10 minutes after becoming unused
- **refetchOnWindowFocus (false)**: Prevents automatic refetching when user returns to the tab
- **retry (1)**: Failed requests are retried once before showing an error

## Cache Invalidation Strategies

All mutation hooks implement comprehensive cache invalidation to ensure data consistency:

### Pattern 1: List and Detail Invalidation

When updating or deleting a resource, both the list and detail queries are invalidated:

```javascript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ["members"] });
  queryClient.invalidateQueries({ queryKey: ["members", variables.id] });
};
```

### Pattern 2: Related Resource Invalidation

When mutations affect multiple resources, all related queries are invalidated:

```javascript
// Example: Assigning a membership to a member
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({ queryKey: ["members"] });
  queryClient.invalidateQueries({ queryKey: ["members", variables.memberId] });
  queryClient.invalidateQueries({ queryKey: ["memberships"] });
};
```

## Optimistic Updates

Optimistic updates provide immediate feedback to users by updating the UI before the server responds. If the mutation fails, the changes are automatically rolled back.

### Implementation Pattern

All update mutations follow this pattern:

```javascript
useMutation({
  mutationFn: ({ id, data }) => api.update(id, data),

  // 1. Optimistic update
  onMutate: async ({ id, data }) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["resource", id] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(["resource", id]);

    // Optimistically update cache
    if (previous) {
      queryClient.setQueryData(["resource", id], {
        ...previous,
        ...data,
      });
    }

    // Return context for rollback
    return { previous, id };
  },

  // 2. Success - invalidate to refetch
  onSuccess: (_, variables) => {
    queryClient.invalidateQueries({ queryKey: ["resource"] });
    queryClient.invalidateQueries({ queryKey: ["resource", variables.id] });
  },

  // 3. Error - rollback optimistic update
  onError: (error, _, context) => {
    if (context?.previous) {
      queryClient.setQueryData(["resource", context.id], context.previous);
    }
  },

  // 4. Always refetch to ensure consistency
  onSettled: (_, __, variables) => {
    queryClient.invalidateQueries({ queryKey: ["resource", variables.id] });
  },
});
```

### Hooks with Optimistic Updates

The following hooks implement optimistic updates:

1. **useUpdateMember** - Updates member details immediately
2. **useDeleteMember** - Removes member from list immediately
3. **useUpdateTrainer** - Updates trainer details immediately
4. **useUpdateClass** - Updates class details immediately
5. **useBookClass** - Increments enrollment count immediately
6. **useCancelBooking** - Decrements enrollment count immediately
7. **useUpdateWorkout** - Updates workout plan immediately
8. **useUpdateMembership** - Updates membership plan immediately

## Background Refetching

Background refetching is automatically handled by TanStack Query:

- When data becomes stale (after 5 minutes), it's refetched in the background
- Users see cached data immediately while fresh data loads
- UI updates seamlessly when new data arrives

## Query Keys Structure

Consistent query key structure enables efficient cache management:

```javascript
// List queries
["members"][("members", { page: 1, search: "john" })][
  // Detail queries
  ("members", memberId)
][
  // Nested resource queries
  ("members", memberId, "bookings")
][("members", memberId, "workout-plans")][("classes", classId, "bookings")];
```

## Performance Benefits

1. **Reduced Network Requests**: 5-minute stale time prevents unnecessary API calls
2. **Instant UI Updates**: Optimistic updates provide immediate feedback
3. **Automatic Rollback**: Failed mutations automatically revert UI changes
4. **Consistent Data**: Cache invalidation ensures data stays synchronized
5. **Better UX**: Users see instant responses while data syncs in background

## Best Practices

1. **Always invalidate related queries** after mutations
2. **Use optimistic updates** for frequently used mutations
3. **Provide rollback context** in onMutate for error recovery
4. **Use onSettled** to ensure data consistency after mutations
5. **Structure query keys consistently** for efficient cache management

## Testing Optimistic Updates

To test optimistic updates:

1. Slow down network in browser DevTools (Network tab → Throttling)
2. Perform an update operation (e.g., edit member details)
3. Observe immediate UI update before server response
4. Verify data consistency after server responds
5. Test error scenarios by disconnecting network

## Future Enhancements

Potential future optimizations:

- Implement prefetching for predictable navigation patterns
- Add infinite queries for large lists
- Implement selective cache updates for list queries
- Add query cancellation for abandoned requests

```

```
