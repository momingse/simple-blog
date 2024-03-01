import { SSR } from "./Project";

type HomeInfo = {
  name: string;
  descipion: string;
  languages: string[];
  mainTechStack: string[];
  interestedArea: string[];
};

type HomeProps = {
  homeInfo: HomeInfo;
};

const Home: SSR<HomeProps> = ({ homeInfo }) => {
  const { name, descipion, languages, mainTechStack, interestedArea } =
    homeInfo;

  return (
    <div className="flex flex-col max-w-[666px] pt-3 font-b m-auto gap-2">
      <h1 className="font-light text-4xl text-zinc-900">{name}</h1>
      <div>{descipion}</div>
      <div>
        <span className="font-bold">Language: </span>
        {languages.map((language) => {
          return (
            <span key={language} className="pl-2">
              {language}
            </span>
          );
        })}
      </div>
      <div>
        <span className="font-bold">Familiar Tech Stack: </span>
        {mainTechStack.map((tech) => {
          return (
            <span key={tech} className="pl-2">
              {tech}
            </span>
          );
        })}
      </div>
      <div>
        <span className="font-bold">Interested Area: </span>
        {interestedArea.map((area) => {
          return (
            <span key={area} className="pl-2">
              {area}
            </span>
          );
        })}
      </div>
    </div>
  );
};

Home.getInitialProps = () => {
  return {
    homeInfo: {
      name: "Harry Chow",
      descipion: "A year 3 student from HKUST majored in Computer Sciencs.",
      languages: ["Javascript", "Python", "C\\C++", "Kotlin"],
      mainTechStack: ["Reactjs", "Nextjs", "Expressjs"],
      interestedArea: ["FullStack", "AI", "Computer Vision"],
    },
  } as HomeProps;
};

export default Home;
