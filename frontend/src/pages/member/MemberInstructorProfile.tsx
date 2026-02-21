import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { classesService } from "@/services/classes.service";
import { toast } from "sonner";

const MemberInstructorProfile = () => {
  const { trainerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!trainerId) return;
      setLoading(true);
      try {
        const data = await classesService.getInstructorProfile(trainerId);
        setProfile(data);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load instructor profile");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [trainerId]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Instructor Profile</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading profile...</p>}

      {!loading && !profile && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Instructor profile not found.</p>
          </CardContent>
        </Card>
      )}

      {!loading && profile && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{profile.fullName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{profile.averageRating}/5 Rating</Badge>
                <Badge variant="outline">{profile.ratingsCount} Reviews</Badge>
                <Badge variant="outline">{profile.experience} Years Experience</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{profile.bio || "No bio provided."}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specializations</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {(profile.specializations || []).length === 0 && (
                <span className="text-sm text-muted-foreground">No specializations listed.</span>
              )}
              {(profile.specializations || []).map((item: string) => (
                <Badge key={item} variant="outline">{item}</Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Class History</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase text-muted-foreground">Past Classes</p>
                <p className="text-xl font-semibold">{profile.classHistory?.pastClassesCount ?? 0}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase text-muted-foreground">Upcoming Classes</p>
                <p className="text-xl font-semibold">{profile.classHistory?.upcomingClassesCount ?? 0}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs uppercase text-muted-foreground">Top Class Types</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(profile.classHistory?.topClassTypes || []).length === 0 && (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  )}
                  {(profile.classHistory?.topClassTypes || []).map((type: string) => (
                    <Badge key={type} variant="secondary">{type}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default MemberInstructorProfile;
