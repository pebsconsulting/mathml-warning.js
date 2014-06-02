/* -*- Mode: Java; tab-width: 2; indent-tabs-mode:nil; c-basic-offset: 2 -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
/*jslint browser: true*/

"use strict";

(function () {
    var locales = {
      "": {
        "dir": "ltr",
        "warning": "Your browser does not seem to have good MathML support!",
        "none": "Ignore",
        "css": "Apply mathml.css",
        "js": "Load MathJax.js"
      }
    };

    function initUI(aDiv, aFirstCall)
    {
      var el, language, req, json;

      // Try and find a translation for the user language.
      language = navigator.language || navigator.browserLanguage;
      while (!locales.hasOwnProperty(language)) {
        language = language.substr(0, language.lastIndexOf("-"));
      }

      // Set the direction of the div
      aDiv.setAttribute("dir", locales[language].dir);

      // Localize the warning message
      el = aDiv.getElementsByTagName("span")[0];
      el.textContent = locales[language].warning; el = el.nextElementSibling;

      // Localize the buttons and register the click events.
      while (el) {
        el.textContent = locales[language][el.name];
        if (aFirstCall) {
          el.addEventListener("click", function (aEvent) {
            handleChoice(aDiv, aEvent.target.name);
          });
        }
        el = el.nextElementSibling;
      }

      if (aFirstCall) {
        // Load the locales and update the UI.
        req = new XMLHttpRequest();
        req.overrideMimeType("application/json");  
        req.open("GET", "locales.json", true);
        req.onreadystatechange = function () {
          if (req.readyState === 4 && req.status === 200) {
            json = JSON.parse(req.responseText);
            json[""] = locales[""];
            locales = json;
            initUI(aDiv, false);
          }
        }
        req.send();
      }
    }

    function handleChoice(aDiv, aChoice)
    {
      var el;
      switch (aChoice) {
        case "css":
          // Insert the mathml.css stylesheet.
          el = document.createElement("link");
          el.href = "http://fred-wang.github.io/mathml.css/mathml.css";
          el.rel = "stylesheet";
          document.head.appendChild(el);
        break;
        case "js":
          // Insert the MathJax.js script.
          el = document.createElement("script");
          el.src = "http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=MML_HTMLorMML";
          document.head.appendChild(el);
        break;
        default:
          // Ignore the warning.
      }
      if (aDiv) {
        // Save the choice in the cookie and remove the warning.
        document.cookie = "MathMLFallback=" + aChoice +
                          ";path=/;max-age=" + 30 * 24 * 3600;
        document.body.removeChild(aDiv);
      }
    }

    window.addEventListener("load", function () {
        var box, div, namespaceURI, button;
        // First check whether the page contains any <math> element.
        namespaceURI = "http://www.w3.org/1998/Math/MathML";
        if (document.body.getElementsByTagNameNS(namespaceURI, "math")[0]) {
            // Create a div to test mpadded, using Kuma's "offscreen" CSS
            document.body.insertAdjacentHTML("afterbegin", "<div style='border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px;'><math xmlns='" + namespaceURI + "'><mpadded height='23px' width='77px'></mpadded></math></div>");
            div = document.body.firstChild;
            box = div.firstChild.firstChild.getBoundingClientRect();
            document.body.removeChild(div);
            if (true || Math.abs(box.height - 23) > 1  || Math.abs(box.width - 77) > 1) {
                // MathML does not seem to be supported...
                if (document.cookie) {
                  // If the cookie is set, apply the saved choice.
                  handleChoice(null,
                               document.cookie.replace(/^.*=(.*)$/, "$1"));
                } else {
                  // Otherwise, insert the warning.
                  document.body.insertAdjacentHTML("afterbegin", "<div style='border: 2px solid orange; box-shadow: 0 0 1em gold; padding: 10px; margin: 0; top: 0; width: 95%; background: #fcf6d4; position: fixed; z-index: 2147483647;'><style scoped='scoped'>div { font-family: sans; } button { background: #ffd; }</style><span></span> <button name='none'></button><button name='css'></button> <button name='js'></button></div>");
                  div = document.body.firstChild;
                  initUI(div, true);
                }
            }
        }
    });
}());
