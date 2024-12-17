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
    }
};

// Add helper function to get full image path
export const getImagePath = (locationKey) => {
    const location = LOCATIONS[locationKey];
    return process.env.PUBLIC_URL + location.imagePath;
}; 