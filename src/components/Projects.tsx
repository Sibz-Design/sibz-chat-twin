
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Home } from "lucide-react";
import { Link } from "react-router-dom";
import sentifyImage from "@/assets/Sentify.png";
import yt_dashboardImage from "@/assets/yt_dashboard.png";

const projects = [
  {
    title: "YouTube Comment Analytics Dashboard",
    description: "A python-based web application for analyzing YouTube commwnts with interactive charts, sentiment analysis, and video data visualization.",
    image: yt_dashboardImage,
    link: "https://car-sense-t14j.onrender.com/",
  },
  {
    title: "Sentiment Analysis Dashboard",
    description: "An interactive, visually intuitive web application for performing real-time sentiment analysis using Hugging Face's powerful natural language processing (NLP) models.",
    image: sentifyImage,
    link: "https://sentiment-dashboard-evzvmpqgutwht5bubgbh4u.streamlit.app/",
  },
];

export function Projects() {
  return (
    <div className="mt-4 grid md:grid-cols-3 gap-4 text-left max-w-4xl mx-auto">
      
      {projects.map((project, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{project.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <img src={project.image} alt={project.title} className="w-full h-48 object-cover mb-4" />
            <p className="text-sm text-muted-foreground">{project.description}</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href={project.link} target="_blank" rel="noopener noreferrer">View Project</a>
            </Button>
          </CardFooter>
        </Card>
      ))}
      <div className="md:col-span-3 text-center mt-8">
        <Button asChild>
          <a href="https://github.com/Sibz-Design" target="_blank" rel="noopener noreferrer">
            <Github className="w-5 h-5 mr-2" />
            View on GitHub
          </a>
        </Button>
      </div>
    </div>
  );
}
