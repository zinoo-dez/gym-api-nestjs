import { memo } from "react";
import { motion } from "framer-motion";

export const WorkoutPlanCard = memo(function WorkoutPlanCard({
  name,
  description,
  duration,
  difficulty,
  exercises,
  image,
  trainer,
  onSelect,
  onPreview,
  className = "",
  ...props
}) {
  const difficultyColors = {
    beginner: "text-primary bg-primary/10",
    intermediate: "text-accent bg-accent/10",
    advanced: "text-orange-500 bg-orange-500/10",
  };

  return (
    <motion.div
      className={`
        bg-dark-800 rounded-3xl overflow-hidden
        border border-white/5 hover:border-primary/20
        transition-all duration-300 shadow-dark
        dark:bg-dark-800 dark:border-white/5
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      {...props}
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden bg-dark-700">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <svg className="w-16 h-16 text-primary/40" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/40 to-transparent" />
        
        {/* Difficulty badge */}
        {difficulty && (
          <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${difficultyColors[difficulty.toLowerCase()] || difficultyColors.beginner}`}>
            {difficulty}
          </div>
        )}

        {/* Duration badge */}
        {duration && (
          <div className="absolute bottom-4 left-4 bg-dark-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-sm font-semibold">{duration}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 dark:text-white">
          {name}
        </h3>

        {description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2 dark:text-gray-300">
            {description}
          </p>
        )}

        {/* Trainer info */}
        {trainer && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-400 text-sm dark:text-gray-400">
              by {trainer}
            </span>
          </div>
        )}

        {/* Exercise count */}
        {exercises && (
          <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            <span>{exercises} exercises</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {onPreview && (
            <button
              onClick={onPreview}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900"
              aria-label={`Preview ${name} workout plan`}
            >
              Preview
            </button>
          )}
          {onSelect && (
            <button
              onClick={onSelect}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-accent text-dark-900 rounded-xl font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900"
              aria-label={`Start ${name} workout plan`}
            >
              Start Plan
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});
