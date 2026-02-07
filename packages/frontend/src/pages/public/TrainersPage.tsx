import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../../layouts";
import { TrainerCard } from "@/components/gym";
import { trainersService, type Trainer } from "@/services/trainers.service";
import { useGymSettings } from "@/hooks/use-gym-settings";

export default function TrainersPage() {
  const {
    trainersTitle,
    trainersSubtitle,
    ctaTitle,
    ctaSubtitle,
    ctaButtonLabel,
  } = useGymSettings();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await trainersService.getAll({ limit: 50 });
        setTrainers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching trainers:", error);
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading trainers...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {trainersTitle}
            </h1>
            <div
              className="text-lg text-muted-foreground max-w-2xl mx-auto [&_img]:max-w-full [&_img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: trainersSubtitle || "" }}
            />
          </div>

          {!trainers || trainers.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground mb-4">
                No trainers available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <>
              {/* Trainer Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {(trainers || []).map((trainer) => (
                  <TrainerCard
                    key={trainer.id}
                    name={`${trainer.firstName} ${trainer.lastName}`}
                    specialty={trainer.specializations[0] || "General Fitness"}
                    experience={
                      trainer.yearsOfExperience
                        ? `${trainer.yearsOfExperience} years`
                        : "Experienced"
                    }
                    image={trainer.profileImage || undefined}
                    rating={trainer.rating || 5.0}
                    certifications={trainer.certifications}
                  />
                ))}
              </div>
            </>
          )}

          {/* Join CTA */}
          <div className="mt-20 text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {ctaTitle}
            </h2>
            <div
              className="text-muted-foreground mb-6 max-w-xl mx-auto [&_img]:max-w-full [&_img]:rounded-xl"
              dangerouslySetInnerHTML={{ __html: ctaSubtitle || "" }}
            />
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              {ctaButtonLabel}
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
