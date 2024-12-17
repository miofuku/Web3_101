export const LOCATIONS = {
    MOUNT_FUJI: {
        name: "Mount Fuji",
        country: "Japan",
        coordinates: "35.3606° N, 138.7278° E",
        imagePath: "/assets/mount-fuji.jpeg",
        description: "Japan's highest mountain and most iconic landmark"
    },
    EIFFEL_TOWER: {
        name: "Eiffel Tower",
        country: "France",
        coordinates: "48.8584° N, 2.2945° E",
        imagePath: "/assets/eiffel-tower.jpeg",
        description: "The most famous symbol of Paris and France"
    },
    GREAT_WALL: {
        name: "Great Wall",
        country: "China",
        coordinates: "40.4319° N, 116.5704° E",
        imagePath: "/assets/great-wall.jpeg",
        description: "The longest wall in the world, a UNESCO World Heritage site"
    },
    EGYPTIAN_PYRAMID: {
        name: "Great Pyramid of Giza",
        country: "Egypt",
        coordinates: "29.9792° N, 31.1342° E",
        imagePath: "/assets/egyptian-pyramid.jpeg",
        description: "The oldest and largest of the three pyramids in the Giza pyramid complex"
    }
};

// Add helper function to get full image path
export const getImagePath = (locationKey) => {
    const location = LOCATIONS[locationKey];
    return process.env.PUBLIC_URL + location.imagePath;
}; 