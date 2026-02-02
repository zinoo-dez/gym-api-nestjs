
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { PublicLayout } from "../../layouts"
import { TrainerCard } from "@/components/gym"
import { trainersService, type Trainer } from "@/services/trainers.service"

const trainerImages = [
  "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=500&fit=crop",
  "https://images.unsplash.com/photo-1609899464726-209befbaa3e2?w=400&h=500&fit=crop",
]

export default function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const response = await trainersService.getAll({ limit: 50 })
        setTrainers(Array.isArray(response.data) ? response.data : [])
      } catch (error) {
        console.error('Error fetching trainers:', error)
        setTrainers([])
      } finally {
        setLoading(false)
      }
    }

    fetchTrainers()
  }, [])

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
    )
  }

  return (
    <PublicLayout>
      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Meet Our <span className="text-primary">Expert Trainers</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our certified professionals are dedicated to helping you achieve your fitness goals with personalized guidance and support.
            </p>
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
                {(trainers || []).map((trainer, index) => (
                  <TrainerCard 
                    key={trainer.id} 
                    name={`${trainer.firstName} ${trainer.lastName}`}
                    specialty={trainer.specializations[0] || 'General Fitness'}
                    experience={`${3 + (index % 8)} years`}
                    image={trainerImages[index % trainerImages.length]}
                    rating={4.7 + (index * 0.05)}
                    certifications={trainer.certifications}
                  />
                ))}
              </div>
            </>
          )}

          {/* Join CTA */}
          <div className="mt-20 text-center bg-card border border-border rounded-2xl p-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Want to Work With Our Trainers?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Personal training sessions are included in our Pro and Elite memberships. 
              Get customized workout plans and one-on-one guidance.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              View Membership Plans
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
