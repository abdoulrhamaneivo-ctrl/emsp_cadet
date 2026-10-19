import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

/** Carrousel accessible : commandes, navigation clavier, swipe et lecture auto. */
export default function Carousel({
  items,
  ariaLabel,
  renderSlide,
  interval = 5500,
  className = "",
  controlsStyle,
  controlClassName = "",
  slideClassName = "",
  getLabel = (_item, index) => `Diapositive ${index + 1}`,
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);
  const ignoreNextClick = useRef(false);
  const reducedMotion = useReducedMotion();
  const slides = items ?? [];
  const count = slides.length;

  useEffect(() => {
    setIndex((current) => (count ? current % count : 0));
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused || reducedMotion || !interval) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, interval);
    return () => window.clearInterval(timer);
  }, [count, interval, paused, reducedMotion]);

  if (!count) return null;

  const allerA = (destination) => setIndex((destination + count) % count);
  const precedent = () => allerA(index - 1);
  const suivant = () => allerA(index + 1);

  const gererToucheClavier = (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      precedent();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      suivant();
    }
  };

  const terminerFocus = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
  };

  const debuterPointeur = (event) => {
    if (event.pointerType !== "touch") return;
    touchStart.current = event.clientX;
    setPaused(true);
  };

  const terminerPointeur = (event) => {
    if (touchStart.current == null) return;
    const distance = event.clientX - touchStart.current;
    if (Math.abs(distance) > 48) {
      ignoreNextClick.current = true;
      window.setTimeout(() => { ignoreNextClick.current = false; }, 500);
      (distance > 0 ? precedent : suivant)();
    }
    touchStart.current = null;
    setPaused(false);
  };

  return (
    <div
      className={`car ${className}`.trim()}
      role="group"
      aria-roledescription="carrousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={terminerFocus}
      onClickCapture={(event) => {
        if (!ignoreNextClick.current) return;
        event.preventDefault();
        event.stopPropagation();
        ignoreNextClick.current = false;
      }}
      onKeyDown={gererToucheClavier}
      onPointerDown={debuterPointeur}
      onPointerUp={terminerPointeur}
      onPointerCancel={() => {
        touchStart.current = null;
        setPaused(false);
      }}
    >
      <div className="car-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((item, slideIndex) => {
          const actif = slideIndex === index;
          return (
            <article
              key={item.id ?? slideIndex}
              className={`slide ${slideClassName}${actif ? " on" : ""}`.trim()}
              aria-hidden={!actif}
              inert={!actif}
            >
              {renderSlide(item, slideIndex, actif)}
            </article>
          );
        })}
      </div>

      {count > 1 && (
        <div className={`car-ctl ${controlClassName}`.trim()} style={controlsStyle}>
          <button className="arrow" type="button" onClick={precedent} aria-label="Diapositive précédente">
            <ArrowLeft className="ic" aria-hidden="true" />
          </button>
          {slides.map((item, slideIndex) => (
            <button
              key={item.id ?? slideIndex}
              className={`dotb${slideIndex === index ? " on" : ""}`}
              type="button"
              aria-label={getLabel(item, slideIndex)}
              aria-current={slideIndex === index ? "true" : undefined}
              onClick={() => allerA(slideIndex)}
            />
          ))}
          <button className="arrow" type="button" onClick={suivant} aria-label="Diapositive suivante">
            <ArrowRight className="ic" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
