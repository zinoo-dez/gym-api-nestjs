import { memo } from "react";
import { motion } from "framer-motion";
import { PrimaryButton } from "../common/PrimaryButton";
import { SecondaryButton } from "../common/SecondaryButton";

export const PricingCard = memo(function PricingCard({
  name,
  price,
  period = "month",
  description,
  features = [],
  isPopular = false,
  isPremium = false,
  onSelect,
  buttonText = "Get Started",
  className = "",
  ...props
}) {
  const ButtonComponent = isPremium ? PrimaryButton : SecondaryButton;

  return (
    <motion.div
      className={`
        relative rounded-3xl p-8
        ${isPremium 
          ? "bg-gradient-to-br from-dark-800 to-dark-700 border-2 border-primary shadow-glow-lg" 
          : "bg-dark-800 border border-white/5 hover:border-primary/20"
        }
        transition-all duration-300
        dark:bg-dark-800 dark:border-white/5
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      {...props}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-dark-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2 dark:text-white">
          {name}
        </h3>
        {description && (
          <p className="text-gray-400 text-sm dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-bold text-primary dark:text-primary">
            ${price}
          </span>
          <span className="text-gray-400 text-lg dark:text-gray-400">
            /{period}
          </span>
        </div>
      </div>

      <ul className="space-y-4 mb-8" role="list">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-primary flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-gray-300 text-sm dark:text-gray-300">
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <ButtonComponent
        onClick={onSelect}
        fullWidth
        aria-label={`Select ${name} plan`}
      >
        {buttonText}
      </ButtonComponent>
    </motion.div>
  );
});
