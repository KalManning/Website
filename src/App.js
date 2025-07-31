import './App.css';
import Mobile from './Mobile'
import Computer from './Computer'
import { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react"
import { track } from "@vercel/analytics";
function useIsMobile(breakpoint = 1100) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);
  return isMobile;
}
function App() {
  const isMobile = useIsMobile();
  const [schoolCourses, setSchoolCourses] = useState({});
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const minValidYear = currentYear - 2;
   useEffect(() => {
     document.title = "Course Information HDSB";
   }, []);
useEffect(() => {
  const fetchCourses = async () => {
    const cachedData = sessionStorage.getItem('schoolCourses');

    if (cachedData) {
      console.log("Loaded from cache");
      setSchoolCourses(JSON.parse(cachedData));
      setLoading(false);
    } else {
      console.log("Fetching from server...");
      try {
        const res = await fetch("https://script.google.com/macros/s/AKfycbxvynn4u-mwPRSKI7cgCP-SqT_HsR7__f-AFKbjyeTpoFKqMP0ZG66NeHgG8TJJ2JEPPA/exec");
        const data = await res.json();
        setSchoolCourses(data);
        sessionStorage.setItem('schoolCourses', JSON.stringify(data));
      } catch (err) {
        console.error("Failed to load course data", err);
      } finally {
        setLoading(false);
      }
    }
  };

  fetchCourses();
}, []);

  const [showMenu, setShowMenu] = useState(false);
  const [showDiary, setShowDiary] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [touchedCourseList, setTouchedCourseList] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedPathway, setSelectedPathway] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [postSecondaryRequirement, setPostSecondaryRequirement] = useState('');
  const [frenchImmersion, setFrenchImmersion] = useState(false);
  const [video, setVideo] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [showPastActivities, setShowPastActivities] = useState(false);
  const [showSimilars, setShowSimilars] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showTests, setShowTests] = useState(false);


  
  const handleCourseClick = (course, name, hasVideo) => {
     track('course_click', { course, name });
    setSelectedCourse(course);
    setHasVideo(hasVideo);
    setCourseDetails(null); // clear previous data
  
    if (!selectedSchool) return;
  
    fetch(
      `https://script.google.com/macros/s/AKfycbxvynn4u-mwPRSKI7cgCP-SqT_HsR7__f-AFKbjyeTpoFKqMP0ZG66NeHgG8TJJ2JEPPA/exec?course=${course}&school=${selectedSchool}&hasVideo=${hasVideo}`
    )
      .then((res) => res.json())
      .then((result) => {
  console.log("Raw result from Apps Script:", result);

  if (
  result.found === "school" || 
  result.found === "other" || 
  result.found === "schoolPrefix" || 
  result.found === "otherPrefix"
) {

    const safeData = result.data || {};
    setCourseDetails({
  ...safeData,
  curriculum: result.curriculum || [],
  alias: result.alt?.alias || null,
  sourceSchool: result.alt?.sourceSchool || null,
  sourceCode: result.alt?.sourceCode || null,
  curriculumSource: result.alt?.curriculumSource || null,
  hasVideo: hasVideo,

  videos: result.alt?.videos
});
  } else {
  setCourseDetails({
    name: name,
    curriculum: result.curriculum || [],
    curriculumSource: result.alt?.curriculumSource || null,
    activities: [],
    similars: [],
    differences: "",
    notes: "",
    school: "",
    year: "",
    hasVideo: hasVideo,
    videos: result.alt?.videos
  });
}

})



      .catch((err) => {
        console.error("Failed to load course info", err);
        setCourseDetails("error");
      });
  };
const getDynamicMaxChWidth = (items = []) => {
  const maxLen = items.reduce((max, val) => {
    const len = val?.length || 0;
    return Math.max(max, len);
  }, 0);
  const buffer = Math.ceil(maxLen * 1.1);
  return `${Math.min(Math.max(buffer, 50), 100)}ch`;
};
const getDynamicMaxChWidthFromActivities = (activities = []) => {
  const maxLen = activities.reduce((max, act) => {
    const full = `${act.title || ''} – ${act.description || ''}`;
    return Math.max(max, full.length);
  }, 0);
  const buffer = Math.ceil(maxLen * 1.1);
  return `${Math.min(Math.max(buffer, 50), 100)}ch`;
};

  const disciplines = [
    "Art",
    "Business",
    "Canadian and World Studies",
    "Computer Studies",
    "Co-op",
    "English",
    "Français",
    "Guidance and Career Education",
    "Health and Phys. Ed",
    "Mathematics",
    "Science",
    "Social Sciences/Humanities",
    "Tech"
  ];
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [courseDetails, setCourseDetails] = useState(null);

  const allCourses = selectedSchool ? schoolCourses[selectedSchool] || [] : [];

  const courses = allCourses.filter(({ code, hasVideo }) => {
    if (!code) return false;
    
    const grade = code[3];
    const pathway = code[4].toUpperCase();
    const subject = getSubjectFromCode(code);
  
    const matchesGrade =
      selectedGrade === '' || grade === selectedGrade;
  
    const matchesPathway =
      selectedPathway === '' ||
      (selectedPathway === 'University' && (pathway === 'D' ||pathway === 'W' ||pathway === 'U' || pathway === 'M')) ||
      (selectedPathway === 'College' && (pathway !== 'L' &&pathway !== 'E')) ||
      (selectedPathway === 'Apprenticeship' && (pathway !== 'L' &&pathway !== 'E')) ||
      (selectedPathway === 'Workplace');
  
    const matchesSubject =
      selectedSubjects.length === 0 || selectedSubjects.includes(subject);
  
    const matchesSearch =
      searchTerm === '' || (code + (schoolCourses[selectedSchool]?.find(c => c.code === code)?.name || "")).toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesPostSecondaryReq =
      postSecondaryRequirement === '' ||
      (postSecondaryRequirement === 'McMaster Health Science: non-math, non-science, non-tech' &&
        !['M', 'S', 'I', 'T'].includes(code[0]) &&
        !code.startsWith('ENG4U') &&
        (pathway === 'U' || pathway === 'M') &&
        grade === "4")||
        (postSecondaryRequirement === '2 of 3: Chemistry, Physics, Biology' &&
        (code.startsWith('SBI4U') || code.startsWith('SCH4U') ||code.startsWith('SPH4U')));
    const matchesVideo = !video || hasVideo;
    return matchesVideo && matchesGrade && matchesPathway && matchesSubject && matchesSearch && matchesPostSecondaryReq && (!frenchImmersion || code.endsWith("4"));
  });
  
  useEffect(() => {
    if (!touchedCourseList && selectedSchool === '') {
      setTouchedCourseList(true);
    }
  }, [selectedSchool, courses, touchedCourseList]);  
  
  const closeSidebar = () => setSelectedCourse(null);

  return (
    <div className="App">
      {isMobile ? (
        <Mobile
          courses={courses}
          schoolCourses={schoolCourses}
          selectedSchool={selectedSchool}
          setSelectedSchool={setSelectedSchool}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          hasVideo={hasVideo}
          handleCourseClick={handleCourseClick}
          courseDetails={courseDetails}
          setCourseDetails={setCourseDetails}
          loading={loading}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          showDiary={showDiary}
          setShowDiary={setShowDiary}
          touchedCourseList={touchedCourseList}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedPathway={selectedPathway}
          setSelectedPathway={setSelectedPathway}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          postSecondaryRequirement={postSecondaryRequirement}
          setPostSecondaryRequirement={setPostSecondaryRequirement}
          frenchImmersion={frenchImmersion}
          setFrenchImmersion={setFrenchImmersion}
          video={video}
          selectedSubjects={selectedSubjects}
          setSelectedSubjects={setSelectedSubjects}
          setVideo={setVideo}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          showDisclaimer={showDisclaimer}
          setShowDisclaimer={setShowDisclaimer}
          showCurriculum={showCurriculum}
          setShowCurriculum={setShowCurriculum}
          showPastActivities={showPastActivities}
          setShowPastActivities={setShowPastActivities}
          showSimilars={showSimilars}
          setShowSimilars={setShowSimilars}
          showNotes={showNotes}
          setShowNotes={setShowNotes}
          showTests={showTests}
          setShowTests={setShowTests}
          getDynamicMaxChWidth={getDynamicMaxChWidth}
          getDynamicMaxChWidthFromActivities={getDynamicMaxChWidthFromActivities}
          minValidYear={minValidYear}
          disciplines={disciplines}
          closeSidebar={closeSidebar}
        />
      ) : (
        <Computer
          courses={courses}
          schoolCourses={schoolCourses}
          selectedSubjects={selectedSubjects}
          setSelectedSubjects={setSelectedSubjects}
          selectedSchool={selectedSchool}
          setSelectedSchool={setSelectedSchool}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          hasVideo={hasVideo}
          handleCourseClick={handleCourseClick}
          courseDetails={courseDetails}
          setCourseDetails={setCourseDetails}
          loading={loading}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          showDiary={showDiary}
          setShowDiary={setShowDiary}
          touchedCourseList={touchedCourseList}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedPathway={selectedPathway}
          setSelectedPathway={setSelectedPathway}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          postSecondaryRequirement={postSecondaryRequirement}
          setPostSecondaryRequirement={setPostSecondaryRequirement}
          frenchImmersion={frenchImmersion}
          setFrenchImmersion={setFrenchImmersion}
          video={video}
          setVideo={setVideo}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          showDisclaimer={showDisclaimer}
          setShowDisclaimer={setShowDisclaimer}
          showCurriculum={showCurriculum}
          setShowCurriculum={setShowCurriculum}
          showPastActivities={showPastActivities}
          setShowPastActivities={setShowPastActivities}
          showSimilars={showSimilars}
          setShowSimilars={setShowSimilars}
          showNotes={showNotes}
          setShowNotes={setShowNotes}
          showTests={showTests}
          setShowTests={setShowTests}
          getDynamicMaxChWidth={getDynamicMaxChWidth}
          getDynamicMaxChWidthFromActivities={getDynamicMaxChWidthFromActivities}
          minValidYear={minValidYear}
          disciplines={disciplines}
          closeSidebar={closeSidebar}
        />
      )}
      <Analytics />
    </div>
  );
  function getSubjectFromCode(code) {
    if (!code) return null;
    const prefix = code.slice(0, 3);
    const first = code[0];
    const startsWith = (value) => code.startsWith(value);

    if (first === 'A') return 'Art';
    if (first === 'B') return 'Business';
    if (first === 'C' && !startsWith('CO')) return 'Canadian and World Studies';
    if (startsWith('CO') || startsWith('DCO')) return 'Co-op';
    if (prefix === 'KEN') return 'CPP';
    if (first === 'E' || startsWith('NBE')) return 'English';
    if (first === 'F') return 'Français';
    if (first === 'G') return 'Guidance and Career Education';
    if (first === 'H') return 'Social Sciences/Humanities';
    if (first === 'I') return 'Computer Studies';
    if (first === 'M') return 'Mathematics';
    if (first === 'P') return 'Health and Phys. Ed';
    if (first === 'S') return 'Science';
    if (first === 'T') return 'Tech';

    return null;
  }
}

export default App;
