const subPages3D = [
  {
    title: "MapsPeople Office",
    description: "3D office space with furniture and decoration",
    thumbnail: "images/office.png",
    link: "office.html"
  },
  {
    title: "Mall",
    description: "3D map of a shopping mall with branding and models",
    thumbnail: "images/mall.png",
    link: "mall.html"
  },
  {
    title: "Event",
    description: "3D map of an event space with branding and models",
    thumbnail: "images/event.png",
    link: "event.html"
  },
  {
    title: "Stadium",
    description: "3D map of the Q2 Stadium in Austin",
    thumbnail: "images/stadium.png",
    link: "stadium.html"
  },
  {
    title: "Vercel Demo in iframe",
    description: "An example of Map Template as an iframe",
    thumbnail: "images/vercel.png",
    link: "iframe.html"
  },
  {
    title: "Query Builder",
    description: "An easy way to play with Map Template Query Paramaters",
    thumbnail: "images/query.png",
    link: "querybuilder.html"
  }
  /*{
      title: "MapsPeople Office WORK IN PROGRESS",
      description: "3D indoor map of a multi-story office building",
      thumbnail: "https://ambercon.dk/media/5rvouepn/_r5j5165.jpeg?width=479&height=480&quality=100&v=1da3f2bef838b10",
      link: "office3d.html"
  },*/

  
 
  // Add more sub-pages as needed
];

const subPages2D = [
  {
    title: "The White House",
    description: "Interactive map of The White House in Washington DC",
    thumbnail: "images/whitehouse.png",
    link: "whitehouse.html"
}
];

function createGridItems(gridSelector, items) {
  const gridContainer = document.querySelector(gridSelector);

  items.forEach(page => {
      const gridItem = document.createElement('div');
      gridItem.className = 'grid-item';

      gridItem.innerHTML = `
          <h2>${page.title}</h2>
          <img src="${page.thumbnail}" alt="${page.title} thumbnail">
          <p>${page.description}</p>
          <a href="${page.link}">View Map</a>
      `;

      gridContainer.appendChild(gridItem);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createGridItems('.grid-3d', subPages3D);
  createGridItems('.grid-2d', subPages2D);
});