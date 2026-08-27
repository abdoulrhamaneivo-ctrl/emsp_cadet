import { useRef, useState } from "react";
import faqData from "../data/faq.json";
import { Minus, Plus } from "lucide-react";

export default function Faq() {
  const [openId, setOpenId] = useState(null); // which item is open (or null)
  const btnRefs = useRef({}); // map of id -> button element

  const toggle = (id) => setOpenId((curr) => (curr === id ? null : id));

  const handleKeyDown = (e, idList, id) => {
    const idx = idList.indexOf(id);
    if (idx === -1) return;

    let nextIndex = idx;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        nextIndex = (idx + 1) % idList.length;
        break;
      case "ArrowUp":
        e.preventDefault();
        nextIndex = (idx - 1 + idList.length) % idList.length;
        break;
      case "Home":
        e.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        e.preventDefault();
        nextIndex = idList.length - 1;
        break;
      default:
        return;
    }
    const nextId = idList[nextIndex];
    btnRefs.current[nextId]?.focus();
  };

  // Stable list of IDs (fallback to index if JSON item lacks id)
  const ids = faqData.map((item, i) => item.id ?? i);

  return (
    <section aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="text-xl lg:text-4xl font-semibold mb-4">
        Frequently Asked Questions
      </h2>

      <ul className="flex flex-col gap-5" role="list">
        {faqData.map((item, i) => {
          const id = item.id ?? i;
          const isOpen = openId === id;
          const panelId = `faq-panel-${id}`;
          const buttonId = `faq-button-${id}`;

          return (
            <li key={id} className="list-none">
              <div
                className={`${
                  isOpen
                    ? "bg-[var(--card)] border border-[var(--border)] text-[var(--text)] p-6 rounded-lg"
                    : "p-6 bg-[var(--card)] border border-[var(--border)] text-[var(--text)] rounded-lg"
                }`}
              >
                {/* Heading contains the toggle button (ARIA accordion pattern) */}
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    ref={(el) => (btnRefs.current[id] = el)}
                    onClick={() => toggle(id)}
                    onKeyDown={(e) => handleKeyDown(e, ids, id)}
                    className={`w-full flex items-center justify-between gap-3 text-left
                                font-medium lg:text-xl focus:outline-none focus-visible:ring
                                focus-visible:ring-blue-500 rounded-md px-2 py-1`}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    <span
                      className={
                        isOpen ? "text-blue-600" : "text-[var(--text)]"
                      }
                    >
                      {item.question}
                    </span>
                    <span aria-hidden="true" className="shrink-0 inline-flex">
                      {isOpen ? (
                        <Minus color="#2c50e2" strokeWidth={0.75} />
                      ) : (
                        <Plus color="#2c50e2" strokeWidth={0.75} />
                      )}
                    </span>
                  </button>
                </h3>

                {/* Panel (region) */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  aria-hidden={!isOpen}
                  className={`transition-all duration-300 overflow-hidden ${
                    isOpen ? "max-h-40 mt-3" : "max-h-0"
                  }`}
                >
                  <p className="mt-1">{item.answer}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
