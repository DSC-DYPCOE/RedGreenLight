"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './prize.css';

const PrizePage = () => {
  useEffect(() => {
    // Configuration
    const MINIMUM_ADDITIONAL_ITERATION_COUNT = 2;
    const config = {  
      additionalIterationCount: Math.max(MINIMUM_ADDITIONAL_ITERATION_COUNT, 3),
      transitionDuration: 3000,
      prize: 4560000,
      digits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    };

    const USD = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });

    const getPrizeText = () => document.getElementById("prize-text");
    const getTracks = () => document.querySelectorAll(".digit > .digit-track");
    const getFormattedPrize = () => USD.format(config.prize);
    const getPrizeDigitByIndex = index => parseInt(config.prize.toString()[index]);
    const determineIterations = index => index + config.additionalIterationCount;

    const createElement = (type, className, text) => {
      const element = document.createElement(type);
      element.className = className;
      if(text !== undefined) element.innerText = text;
      return element;
    };

    const createCharacter = character => createElement("span", "character", character);

    const createDigit = (digit, trackIndex) => {
      const digitElement = createElement("span", "digit");
      const trackElement = createElement("span", "digit-track");
      
      let digits = [];
      let iterations = determineIterations(trackIndex);
      
      for(let i = 0; i < iterations; i++) {
        digits = [...digits, ...config.digits];
      }
      
      trackElement.innerText = digits.join(" ");
      trackElement.style.transitionDuration = `${config.transitionDuration}ms`;
      digitElement.appendChild(trackElement);
      
      return digitElement;
    };

    const setup = () => {
      let index = 0;
      const prizeText = getPrizeText();
      
      for(const character of getFormattedPrize()) {
        const element = isNaN(character) 
          ? createCharacter(character) : createDigit(character, index++);
        prizeText.appendChild(element);
      }  
    };

    const animate = () => {
      getTracks().forEach((track, index) => {
        const digit = getPrizeDigitByIndex(index);
        const iterations = determineIterations(index);
        const activeDigit = ((iterations - 1) * 10) + digit;
        track.style.translate = `0rem ${activeDigit * -10}rem`;
      });
    };

    const resetTrackPosition = track => {
      track.style.transitionDuration = "0ms";
      track.style.translate = "0rem 0rem";
      track.offsetHeight;
      track.style.transitionDuration = `${config.transitionDuration}ms`;
    };

    const resetAnimation = () => {
      for(const track of getTracks()) resetTrackPosition(track);
    };

    window.handleRedo = () => {
      resetAnimation();
      animate();
    };

    window.handleChangeTheme = (e) => {
      updateTheme(e.currentTarget.dataset.theme);
    };

    const updateTheme = theme => {
      document.documentElement.style.setProperty("--theme-rgb", `var(--${theme})`);
      for(const button of document.querySelectorAll(".theme-button")) {
        button.dataset.selected = theme === button.dataset.theme;
      }
    };

    // Initial setup
    setup();
    setTimeout(animate);
    updateTheme("green");

  }, []);

  return (
    <div id="app">
      <div id="prize">
        <div id="prize-lines" className="prize-filter"></div>
        <div id="prize-shadow" className="prize-filter"></div>
        <h2 id="prize-label">
          <span className="asterisk">*</span>
          <span>CASH PRIZE</span>
          <span className="asterisk">*</span>      
        </h2>
        <h1 id="prize-text"></h1>
      </div>
      
      <div id="shapes">
        <i className="fa-regular fa-circle"></i>
        <i className="fa-regular fa-square"></i>
        <i className="fa-regular fa-triangle"></i>
      </div>
      
      <div id="actions-wrapper">
        <div id="actions">
          <div id="theme-actions">
            <button className="theme-button" data-theme="green" data-selected="true" onClick={(e) => window.handleChangeTheme(e)}>
              <i className="fa-regular fa-circle"></i>
            </button>
            <button className="theme-button" data-theme="blue" onClick={(e) => window.handleChangeTheme(e)}>
              <i className="fa-regular fa-square"></i>
            </button>
            <button className="theme-button" data-theme="pink" onClick={(e) => window.handleChangeTheme(e)}>
              <i className="fa-regular fa-triangle"></i>
            </button>
          </div>
          <button id="redo-button" type="button" onClick={() => window.handleRedo()}>
            <i className="fa-solid fa-arrows-repeat"></i>
            <span>Rerun</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrizePage;