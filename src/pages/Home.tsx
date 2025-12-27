import { ArrowRight, Code2, Cpu, GraduationCap, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import FadeInWrapper from "../components/FadeInWrapper";

const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="space-y-6">
        <FadeInWrapper>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-gray-900">
            Full-Stack Developer <br />
            <span className="text-gray-400">
              focused on building with purpose.
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl leading-relaxed">
            I'm Harry Chow, a Computer Science graduate from HKUST. I specialize
            in full-stack web development and enjoy building scalable,
            performant applications at the intersection of software engineering
            and AI.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/project"
              className="px-6 py-3 bg-black text-white rounded-xl font-medium flex items-center gap-2 hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-0.5"
            >
              View Projects <ArrowRight size={18} />
            </Link>
            <Link
              to="/blog"
              className="px-6 py-3 bg-white border border-gray-200 text-black rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm hover:-translate-y-0.5"
            >
              Read Blog
            </Link>
          </div>
        </FadeInWrapper>
      </section>

      {/* Bio Cards */}
      <section>
        <FadeInWrapper className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Education</h3>
            <p className="text-gray-600 leading-relaxed">
              Computer Science graduate from The Hong Kong University of Science
              and Technology (HKUST), with a focus on Full-Stack Engineering and
              AI-related systems.
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
              <Code2 size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Tech Stack</h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                "JavaScript",
                "TypeScript",
                "Go",
                "Python",
                "React.js",
                "Next.js",
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <Cpu size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Interests</h3>
            <p className="text-gray-600 leading-relaxed">
              Interested in full-stack engineering and AI-driven systems with
              real-world impact.
            </p>
          </div>
          <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Philosophy</h3>
            <p className="text-gray-600 leading-relaxed">
              I believe in writing clean, maintainable code and staying curious
              about emerging technologies that solve real human problems.
            </p>
          </div>
        </FadeInWrapper>
      </section>
    </div>
  );
};

export default Home;
