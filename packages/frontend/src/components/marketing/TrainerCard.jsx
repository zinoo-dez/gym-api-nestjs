import { memo } from "react";
import { motion } from "framer-motion";

export const TrainerCard = memo(function TrainerCard({
  name,
  title,
  specialties = [],
  image,
  bio,
  rating,
  experience,
  onViewProfile,
  onBookSession,
  className = "",
  ...props
}) {
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
      <div className="relative aspect-square overflow-hidden bg-dark-700">
        {image ? (
          <img
            src={image}
            alt={`${name} - ${title}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
            <svg className="w-24 h-24 text-primary/40" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-transparent to-transparent" />
        
        {/* Rating badge */}
        {rating && (
          <div className="absolute top-4 right-4 bg-dark-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1">
            <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-white text-sm font-semibold">{rating}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-1 dark:text-white">
          {name}
        </h3>
        <p className="text-primary text-sm font-semibold mb-3 dark:text-primary">
          {title}
        </p>

        {experience && (
          <p className="text-gray-400 text-xs mb-4 dark:text-gray-400">
            {experience} years experience
          </p>
        )}

        {bio && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2 dark:text-gray-300">
            {bio}
          </p>
        )}

        {/* Specialties */}
        {specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full dark:bg-primary/10 dark:text-primary"
              >
                {specialty}
              </span>
            ))}
            {specialties.length > 3 && (
              <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs font-medium rounded-full">
                +{specialties.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900"
              aria-label={`View ${name}'s profile`}
            >
              View Profile
            </button>
          )}
          {onBookSession && (
            <button
              onClick={onBookSession}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-accent text-dark-900 rounded-xl font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900"
              aria-label={`Book session with ${name}`}
            >
              Book Session
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});
