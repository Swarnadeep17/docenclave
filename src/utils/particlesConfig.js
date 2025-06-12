export default {
  particles: {
    number: { 
      value: 40, 
      density: { 
        enable: true, 
        value_area: 800 
      } 
    },
    color: { 
      value: "#60a5fa" // light blue
    },
    opacity: { 
      value: 0.5, 
      random: true 
    },
    size: { 
      value: 3, 
      random: true 
    },
    line_linked: { 
      enable: true, 
      distance: 150, 
      color: "#93c5fd", 
      opacity: 0.4, 
      width: 1 
    },
    move: { 
      enable: true, 
      speed: 2, 
      direction: "none", 
      random: true, 
      out_mode: "out" 
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: { 
      onhover: { 
        enable: true, 
        mode: "grab" 
      }, 
      onclick: { 
        enable: true, 
        mode: "push" 
      } 
    }
  }
};
