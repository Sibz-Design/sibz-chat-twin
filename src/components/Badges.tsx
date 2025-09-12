import AIBootcampBadge from "@/assets/AI Bootcamp Badge.avif";
import ProfessionalDevelopmentBadge from "@/assets/Professional Development Badge.avif";
import TechnicalSupportBadge from "@/assets/Technical Support Badge.avif";

export function Badges() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-center">My Badges</h2>
      <div className="flex justify-center gap-8 mt-4">
        <img src={AIBootcampBadge} alt="AI Bootcamp Badge" className="w-48 h-48 object-cover rounded-lg shadow-lg transform transition-transform hover:scale-105" />
        <img src={ProfessionalDevelopmentBadge} alt="Professional Development Badge" className="w-48 h-48 object-cover rounded-lg shadow-lg transform transition-transform hover:scale-105" />
        <img src={TechnicalSupportBadge} alt="Technical Support Badge" className="w-48 h-48 object-cover rounded-lg shadow-lg transform transition-transform hover:scale-105" />
      </div>
    </div>
  );
}
