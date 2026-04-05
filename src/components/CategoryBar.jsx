import { useRef, useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import axios from "axios"; // or use your existing api service
import "./CategoryBar.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const DEFAULT_CATEGORIES = [
  "DPDP",
  "SOC 2",
  "HIPAA Assessments",
  "ISO 27001",
  "PCI DSS",
  "Cloud Security",
  "Third Party Risk",
  "Business Continuity",
];

const CategoryBar = ({ categoryLinks = [] }) => {
  const [active, setActive] = useState(0);
  const [apiCats, setApiCats] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Fetch active root categories from the API
    axios
      .get(`${API_BASE}/categories?isActive=true&parent=root`)
      .then((res) => setApiCats(res.data))
      .catch(() => {}); // silently fall back to defaults
  }, []);

  // Priority: API categories → prop categoryLinks → hard-coded defaults
  const labels =
    apiCats.length > 0
      ? apiCats.map((c) => c.name)
      : categoryLinks.length > 0
        ? categoryLinks.map((c) => c.label)
        : DEFAULT_CATEGORIES;

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 220, behavior: "smooth" });
    }
  };

  return (
    <nav className="category-bar">
      <div className="category-bar__inner">
        <div className="category-bar__list" ref={scrollRef}>
          {labels.map((label, i) => (
            <button
              key={i}
              className={`category-bar__item ${active === i ? "active" : ""}`}
              onClick={() => setActive(i)}
            >
              {label}
            </button>
          ))}
        </div>
        <button className="category-bar__arrow" onClick={scrollRight}>
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
};

export default CategoryBar;
