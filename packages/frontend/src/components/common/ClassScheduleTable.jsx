import { memo } from "react";
import { motion } from "framer-motion";

export const ClassScheduleTable = memo(function ClassScheduleTable({
  classes = [],
  onBookClass,
  onViewDetails,
  className = "",
  ...props
}) {
  return (
    <div className={`overflow-x-auto ${className}`} {...props}>
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Time
            </th>
            <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Class
            </th>
            <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Trainer
            </th>
            <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Duration
            </th>
            <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Capacity
            </th>
            <th className="text-left py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Status
            </th>
            <th className="text-right py-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {classes.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center py-12 text-gray-400">
                No classes scheduled
              </td>
            </tr>
          ) : (
            classes.map((classItem, index) => {
              const isFull = classItem.enrolled >= classItem.capacity;
              const spotsLeft = classItem.capacity - classItem.enrolled;
              const isAlmostFull = spotsLeft <= 3 && spotsLeft > 0;

              return (
                <motion.tr
                  key={classItem.id || index}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-white font-semibold text-sm dark:text-white">
                        {classItem.time}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-semibold dark:text-white">
                        {classItem.name}
                      </p>
                      {classItem.type && (
                        <p className="text-gray-400 text-xs mt-1 dark:text-gray-400">
                          {classItem.type}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-300 text-sm dark:text-gray-300">
                      {classItem.trainer}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-300 text-sm dark:text-gray-300">
                      {classItem.duration}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/5 rounded-full h-2 max-w-[80px]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFull ? "bg-red-500" : isAlmostFull ? "bg-accent" : "bg-primary"
                          }`}
                          style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                          role="progressbar"
                          aria-valuenow={classItem.enrolled}
                          aria-valuemin="0"
                          aria-valuemax={classItem.capacity}
                          aria-label={`${classItem.enrolled} of ${classItem.capacity} spots filled`}
                        />
                      </div>
                      <span className="text-gray-400 text-xs whitespace-nowrap dark:text-gray-400">
                        {classItem.enrolled}/{classItem.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        isFull
                          ? "bg-red-500/10 text-red-500"
                          : isAlmostFull
                          ? "bg-accent/10 text-accent"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isFull ? "Full" : isAlmostFull ? `${spotsLeft} left` : "Available"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {onViewDetails && (
                        <button
                          onClick={() => onViewDetails(classItem)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900"
                          aria-label={`View details for ${classItem.name}`}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      {onBookClass && (
                        <button
                          onClick={() => onBookClass(classItem)}
                          disabled={isFull}
                          className="px-4 py-2 bg-primary hover:bg-accent text-dark-900 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900"
                          aria-label={`Book ${classItem.name} class`}
                        >
                          Book
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
});
