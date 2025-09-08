import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { ExternalLink } from "lucide-react";

interface FeaturedCert {
  title: string;
}

const DRIVE_URL = "https://drive.google.com/drive/folders/1ubhYNykU6iMgzSvxeix6WpdfVniZGc5A?usp=sharing";

const featuredCertificates: FeaturedCert[] = [
  { title: "AI Bootcamp" },
  { title: "Cisco Networking Academy" },
  { title: "Professional Development" },
  { title: "Technical Support" },
];

export function Certificates() {
  return (
    <div className="mt-4 grid md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A curated collection of my certifications across AI, networking, support, and professional development.
          </p>
          <div className="flex flex-wrap gap-2">
            {featuredCertificates.map((cert, idx) => (
              <span key={idx} className="px-3 py-1 text-xs rounded-full bg-primary/10 border border-primary/20">
                {cert.title}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href={DRIVE_URL} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View all certificates
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


