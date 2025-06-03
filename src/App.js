import './App.css';
import { useState, useEffect } from 'react';

function App() {
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
        const res = await fetch("https://script.google.com/macros/s/AKfycbw6cZQ0V0ndwD5PgpsbjeC_lbbQc9bYmrb_ZFkMimh88I1fHa6f098vo3fjxdblKbWJjQ/exec");
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


  const [selectedCourse, setSelectedCourse] = useState(null);
  const [touchedCourseList, setTouchedCourseList] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedPathway, setSelectedPathway] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [postSecondaryRequirement, setPostSecondaryRequirement] = useState('');
  const [frenchImmersion, setFrenchImmersion] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);


  
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setCourseDetails(null); // clear previous data
  
    if (!selectedSchool) return;
  
    fetch(
      `https://script.google.com/macros/s/AKfycbw6cZQ0V0ndwD5PgpsbjeC_lbbQc9bYmrb_ZFkMimh88I1fHa6f098vo3fjxdblKbWJjQ/exec?course=${course}&school=${selectedSchool}`
    )
      .then((res) => res.json())
      .then((result) => {
        if (result.found === "school" || result.found === "other") {
          setCourseDetails(result.data);
        } else {
          setCourseDetails("none");
        }
      })
      .catch((err) => {
        console.error("Failed to load course info", err);
        setCourseDetails("error");
      });
  };

  const disciplines = [
    "Art",
    "Business",
    "Canadian and World Studies",
    "Computer Studies",
    "Co-op",
    "CPP",
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

  const courses = allCourses.filter(({ code }) => {
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
        grade === "4");
  
    return matchesGrade && matchesPathway && matchesSubject && matchesSearch && matchesPostSecondaryReq && (!frenchImmersion || code.endsWith("4"));
  });
  
  useEffect(() => {
    if (!touchedCourseList && selectedSchool === '') {
      setTouchedCourseList(true);
    }
  }, [selectedSchool, courses, touchedCourseList]);  
  
  const closeSidebar = () => setSelectedCourse(null);

  return (
    <div className="App max-h-screen flex flex-col overflow-hidden">
      <div className="flex gap-9 items-center bg-gray-300">
        <a
          href="https://hdsb.elearningontario.ca/d2l/home/3200161"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline text-blue-700"
        >
          <img
            src="/D2L.png"
            alt="Brightspace"
            className="h-6 w-auto"
          />
          Brightspace
        </a>
        <a
          href="https://app.myblueprint.ca/?returnUrl=/student/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline text-blue-700"
        >
          <img
            src="/MyBlueprint.png"
            alt="MyBlueprint"
            className="h-6 w-auto"
          />
          myBlueprint
        </a>
        <button
          onClick={() => setShowDisclaimer(true)}
          className="flex items-center gap-2 hover:underline text-blue-700">
            Disclaimer
        </button>
      </div>
      <header className="App-header flex flex-col flex-grow items-center space-y-6 p-6">
        <div className="absolute top-12 right-4">
          <button
            onClick={() => setShowSuggestions(true)}
            className="bg-gray-100 hover:bg-blue-400 text-black px-4 py-2 rounded-lg shadow text-sm"
          >
            Navigation Suggestions
          </button>
        </div>
        <h1 className="text-4xl font-bold">HDSB Courses Additional Information</h1>

        <input
          type="text"
          placeholder="Search Course Code or Name"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-1/2 text-black"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <p className="text-2xl font-semibold">Or Filter By:</p>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          
          <div className="flex flex-col md:flex-column gap-6 justify-center items-center">
          <select
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 text-black text-base ${
              !selectedSchool && touchedCourseList
                ? 'border-4 border-red-500 focus:ring-red-500 ring-5'
                : 'border-gray-300 focus:ring-blue-400'
            }`}
            value={selectedSchool}
            onChange={(e) => setSelectedSchool(e.target.value)}
          >
              <option value="">Select School</option>
              <option value="Abbey Park High School">Abbey Park High School</option>
              <option value="Acton District School">Acton District School</option>
              <option value="Aldershot High School">Aldershot High School</option>
              <option value="Burlington Central High School">Burlington Central High School</option>
              <option value="Craig Kielburger Secondary School">Craig Kielburger Secondary School</option>
              <option value="Dr. Frank J. Hayden Secondary School">Dr. Frank J. Hayden Secondary School</option>
              <option value="Elsie MacGill Secondary School">Elsie MacGill Secondary School</option>
              <option value="Garth Webb Secondary School">Garth Webb Secondary School</option>
              <option value="Georgetown District High School">Georgetown District High School</option>
              <option value="Iroquois Ridge High School">Iroquois Ridge High School</option>
              <option value="M.M. Robinson High School">M.M. Robinson High School</option>
              <option value="Milton District High School">Milton District High School</option>
              <option value="Nelson High School">Nelson High School</option>
              <option value="Oakville Trafalgar High School">Oakville Trafalgar High School</option>
              <option value="T.A. Blakelock High School">T.A. Blakelock High School</option>
              <option value="White Oaks Secondary School">White Oaks Secondary School</option>

            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black text-base"
              value={selectedPathway}
              onChange={(e) => setSelectedPathway(e.target.value)}
            >
              <option value="">All Pathways</option>
              <option value="University">University</option>
              <option value="College">College</option>
              <option value="Apprenticeship">Apprenticeship</option>
              <option value="Workplace">Workplace</option>
            </select>

            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black text-base"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              <option value="1">9</option>
              <option value="2">10</option>
              <option value="3">11</option>
              <option value="4">12</option>
            </select>
          </div>
            
          <div className="mt-4 max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 max-w-md md:w-[20rem] bg-white text-sm text-black space-y-2">
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedSubjects.length === disciplines.length}
                  onChange={() => {
                    const allSelected = selectedSubjects.length === disciplines.length;
                    setSelectedSubjects(allSelected ? [] : disciplines);
                  }}
                />
                <span className="font-medium">Select All Subjects</span>
              </label>

              <button
                className="text-red-500 text-xs underline ml-1 w-fit"
                onClick={() => setSelectedSubjects([])}
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {disciplines.map((subject) => (
                <label key={subject} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => {
                      setSelectedSubjects((prev) =>
                        prev.includes(subject)
                          ? prev.filter((s) => s !== subject)
                          : [...prev, subject]
                      );
                    }}
                  />
                  <span>{subject}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 justify-center items-center">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black text-base">
              <option value="">Coming Soon: SHSM Major Credit</option>
              <option value="Agriculture and Veterinary">Agriculture and Veterinary</option>
              <option value="Arts and Culture">Arts and Culture</option>
              <option value="Business">Business</option>
              <option value="Information and Communications Technology">Information and Communications Technology</option>
              <option value="Construction">Construction</option>
              <option value="Energy">Energy</option>
              <option value="Environment">Environment</option>
              <option value="Health and Wellness">Health and Wellness</option>
              <option value="Horticulture and Landscaping">Horticulture and Landscaping</option>
              <option value="Hospitality and Tourism">Hospitality and Tourism</option>
              <option value="Justice, Community Safety & Emergency Services">Justice, Community Safety & Emergency Services</option>
              <option value="Manufacturing, Engineering and Robotics">Manufacturing, Engineering and Robotics</option>
              <option value="Sports">Sports</option>
              <option value="Social Justice">Social Justice</option>
              <option value="Transportation">Transportation</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-black text-base"
              value={postSecondaryRequirement}
              onChange={(e) => setPostSecondaryRequirement(e.target.value)}
            >
              <option value="">Post-Secondary Requirement</option>
              <option value="McMaster Health Science: non-math, non-science, non-tech">
                McMaster Health Science: non-math, non-science, non-tech
              </option>
            </select>

            {/* French Immersion + Clear Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <div className="bg-white rounded-lg px-4 py-2 border border-gray-300 flex items-center gap-4">
              <label className="flex items-center gap-2 text-black text-sm">
                <input
                  type="checkbox"
                  checked={frenchImmersion}
                  onChange={() => setFrenchImmersion((prev) => !prev)}
                />
                <span>French Immersion Credit</span>
              </label>
            </div>
            <button
                onClick={() => window.location.reload()}
                className="px-2 py-1 bg-red-200 text-black text-sm rounded-md hover:bg-red-100"
              >
                Clear All Filters
              </button>
            </div>
            
          </div>

        </div>

        {/* Course List */}
        
        <div className="flex-grow w-full h-full overflow-y-auto border border-gray-300 rounded-lg p-4 bg-gray-200 text-sm text-black">
  <h2 className="text-2xl font-semibold mb-4 text-center">Courses</h2>

  {loading ? (
    <p className="text-center text-gray-500 mt-4">Loading courses...</p>
  ) : (
    <div className="flex flex-col items-center mx-auto"> {/* 🛠 Center the whole list */}
      <ul className="space-y-2 w-full max-w-xl"> {/* 🛠 Limit width for better centering */}
        {!selectedSchool ? (
          <li className="text-gray-500 italic text-center">
            Please select a school to retrieve courses.
          </li>
        ) : courses.length > 0 ? (
          <div className="flex flex-col items-center mx-auto">
  <ul className="space-y-2 w-full max-w-xl">
    {courses.map(({ code, name }) => (
      <li key={code} className="w-full flex justify-center items-center space-x-4"> {/* ✅ Make a row */}
        
        {/* Centered Course Code Button */}
        <div className="flex justify-center w-24"> {/* ✅ Center the button */}
          <button
            onClick={() => handleCourseClick(code)}
            className="text-blue-700 hover:underline text-center"
          >
            {code}
          </button>
        </div>

        {/* Course Name Button */}
        <button
          onClick={() => handleCourseClick(code)}
          className="flex-1 text-left text-blue-700 hover:underline truncate max-w-[16rem]"
          title={name}
        >
          {name}
        </button>

      </li>
    ))}
  </ul>
</div>
        ) : (
          <li className="text-gray-500 italic text-center">
            There are no courses which match your filter.
          </li>
        )}
      </ul>
    </div>
  )}
</div>

      </header>

      {/* Sidebar */}
      {showSuggestions && (
        <div className="fixed top-0 right-0 h-full w-full md:w-1/2 bg-gray-900 text-white shadow-lg z-50 transition-transform duration-300 transform translate-x-0">
          <div className="p-6 flex flex-col h-full overflow-y-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Navigation Suggestions</h2>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-red-500 hover:underline text-lg"
              >
                Close ✕
              </button>
            </div>

            <hr className="border-gray-400" />
            <p className='text-xl'>
              Make Filters Broad when Exploring
            </p>
            <ul className="list-disc list-inside space-y-3 text-base text-left">
              <li>Wanting to go to university doesn't mean all of your courses must be U-level.</li>
              <li>Checkmark as many disciplines as possible. You never know what you might find.</li>
              <li>Consider exploring higher grade levels ahead of time.</li>
            </ul>
            <p className='text-xl'>
              Consider challenging yourself
            </p>
            <ul className="list-disc list-inside space-y-3 text-base text-left">
              <li>Compare academic vs applied classes; choosing academic leaves room for flexibility in the future, and often isn't as challenging as you may think.</li>
              <li>Look for classes that will teach you life skills; you may not ace them, but it will benefit you in the long run.</li>
            </ul>
            <p className='text-xl'>
            Ask Questions
            </p>
            <ul className="list-disc list-inside space-y-3 text-base text-left">
              <li>This website doesn't have all the information, and isn't always up to date.</li>
              <li>Ask teachers what their courses are like.</li>
              <li>Ask upper-grade peers what they thought of their classes.</li>
            </ul>
            {/*<button className='absolute bottom-4 right-4 hover:underline'>
              Diary of a ghost
            </button>*/}
          </div>
        </div>
      )}
      {showDisclaimer && (
        <div className="fixed top-0 right-0 h-full w-full md:w-1/2 bg-gray-900 text-white shadow-lg z-50 transition-transform duration-300 transform translate-x-0">
          <div className="p-6 flex flex-col h-full overflow-y-auto space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Disclaimer</h2>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="text-red-500 hover:underline text-lg"
              >
                Close ✕
              </button>
            </div>

            <hr className="border-gray-400" />
            <div className="flex gap-2 text-gray-300 justify-center">
                  <span>This website is created and maintained by a student as an independent project. It is not an official resource of the Halton District School Board (HDSB), and the information provided here may not always be up to date or accurate. While every effort is made to ensure the reliability of the content, users should verify any details with official sources before making decisions based on this website. The site and its creator assume no responsibility for errors, omissions, or any actions taken based on the information provided.
For official HDSB curriculum and policies, please visit HDSB's official website.
</span>
                 
                </div>
            
          </div>
        </div>
      )}
      {selectedCourse && (
        <div className="fixed top-0 right-0 h-full w-full md:w-1/2 bg-gray-900 text-white shadow-lg z-50 transition-transform duration-300 transform translate-x-0">
          <div className="p-6 flex flex-col h-full overflow-y-auto space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Course: {selectedCourse}</h2>
              <button
                onClick={closeSidebar}
                className="text-red-400 hover:underline text-lg"
              >
                Close ✕
              </button>
            </div>

            {/* Divider */}
            <hr className="border-gray-600" />

            {/* Course Overview */}
            {courseDetails && courseDetails !== "none" && courseDetails !== "error" ? (
              <div>{courseDetails.name}</div>
            ) : (
              <div>No course name available.</div>
            )}


            {/* What You Will See */}
            <section>
              <h3 className="text-xl font-semibold mb-2">What You <span className="text-green-400">WILL</span> See (Curriculum)</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>Unit topics pulled from Ministry curriculum</li>
                <div className="flex gap-2 text-gray-300 justify-center">
                  <span>Need more information?</span>
                  <a 
                    href="https://www.dcp.edu.gov.on.ca/en/curriculum#secondary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-400"
                  >
                    Check the course curriculum
                  </a>
                </div>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Past Activities</h3>

              {courseDetails === null && (
                <p className="text-gray-400 italic">Loading activities…</p>
              )}
              {(courseDetails === "none"||  
                (courseDetails && courseDetails !== "none" && courseDetails !== "error" &&((courseDetails.school?.trim().toLowerCase() !== selectedSchool.trim().toLowerCase()))) || 
                (courseDetails && courseDetails !== "none" && courseDetails !== "error" && (courseDetails.year < minValidYear))
              ) && (
                <div className="mt-4 p-4 border border-yellow-400 bg-yellow-50 rounded-xl">
                  <p className="text-md font-semibold text-yellow-700">Have you taken this course? Is the following information outdated, incorrect, or missing?</p>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfTqM4Z-KCO-kVblD7HByEi4BQgQrUGiKjR4f-FJQ_unxQmig/viewform?usp=header"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-600 transition"
                  >
                    Suggest an addition
                  </a>
                </div>
              )}

              {courseDetails === "none" && (
                <p className="text-gray-400 italic">
                  No information available for this course at your school or others. Please ask a teacher to submit an entry.
                </p>
              )}

              {courseDetails && courseDetails !== "none" && courseDetails !== "error" && (
                <>
                 {courseDetails.school?.trim().toLowerCase() !== selectedSchool.trim().toLowerCase() && (
                  <p className="text-red-200">
                    No information on {selectedCourse} at {selectedSchool}, using other sources
                  </p>
                )}
                  <p className="text-sm text-gray-300 italic mb-2">
                    Based on data from {courseDetails.school}, {courseDetails.year}
                  </p>
                  
                    <ul className="list-disc list-inside space-y-8 text-white text-left">
                      {courseDetails.activities.map((act, idx) => (
                        <li key={idx}>
                          <strong>{act.title}</strong>{act.description ? ` – ${act.description}` : ''}
                        </li>
                      ))}
                    </ul>
                  
                  
                  <p className="text-sm italic text-gray-400 mt-1">
                    These activities may vary by teacher and year.
                  </p>
                </>
              )}
            </section>
            <section>
              <h3 className="text-xl font-semibold mb-2">Similar Courses</h3>

              {courseDetails === null && (
                <p className="text-gray-400 italic">Loading information…</p>
              )}

              {courseDetails === "none" && (
                <p className="text-gray-400 italic">
                  No similar courses have been noted.
                </p>
              )}

              {courseDetails && courseDetails !== "none" && courseDetails !== "error" && (
                <>
                    <ul className="list-disc list-inside space-y-3 text-white text-center">
                      {courseDetails.similars.map((act, idx) => (
                        <li key={idx}>
                          {act.title}
                        </li>
                      ))}
                    </ul>
                  
                  <p className="text-xl text-white mt-1 ">
                    <strong>Key differences:</strong>
                  </p>
                  <p className="text-gray-200">
                    {courseDetails.differences}
                  </p>
                </>
              )}
            </section>

            <section>
              <h3 className="text-xl font-semibold mb-2">Additional Notes</h3>

              {courseDetails && courseDetails.notes ? (
                <>
                  <p className="text-sm text-gray-300 italic mb-2">
                    Based on data from {courseDetails.school}, {courseDetails.year}
                  </p>
                  <p className="text-gray-100">
                    {courseDetails.notes}
                  </p>
                </>
                
              ) : (
                <p className="text-gray-400 italic">
                  No notes submitted for this course.
                </p>
              )}
            </section>


          </div>
        </div>
      )}

    </div>
  );
  
}
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


export default App;
