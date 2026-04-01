import mysql from 'mysql2/promise';

console.log('[db] env', {
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 'not set',
  DB_USER: process.env.DB_USER || 'root',
  DB_NAME: process.env.DB_NAME || 'easyvate_cars',
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'easyvate_cars',
  waitForConnections: true,
  connectionLimit: 10,
});

// About Fetch
export async function getAboutData(lang = 'en') {
  const tableName = `about_${lang}`;
  const [aboutRows] = await pool.query('SELECT * FROM ?? LIMIT 1', [tableName]);
  const about = aboutRows[0] || null;

  if (about) {
    const [logoRows] = await pool.query(
      'SELECT * FROM about_logos_en WHERE aboutId = ? ORDER BY `order` ASC',
      [about.id]
    );
    return { about, logos: logoRows };
  }
  return { about: null, logos: [] };
}

//Contact Fetch
export async function getContactData(lang = 'en') {
  const tableName = `contact_${lang}`;
  const [rows] = await pool.query(`SELECT * FROM ?? ORDER BY id`, [tableName]);
  return rows;
}

//Team Fetch
export async function getTeamData(lang = 'en') {
  const tableName = `team_${lang}`;
  const [rows] = await pool.query(`SELECT * FROM ?? ORDER BY id`, [tableName]);
  return rows;
}

//Vehicle Fetch
export async function getAllVehicles() {
  // Fetch all vehicles
  const [vehicles] = await pool.query("SELECT * FROM vehicles WHERE status = 'Available' ORDER BY createdAt DESC");
  if (vehicles.length === 0) return [];

  // Fetch all images for these vehicles in one query
  const vehicleIds = vehicles.map(v => v.id);
  const [images] = await pool.query(
    'SELECT vehicleId, path FROM vehicle_images WHERE vehicleId IN (?) ORDER BY `order` ASC',
    [vehicleIds]
  );

  // Build a map of vehicleId -> array of image paths
  const imageMap = images.reduce((acc, img) => {
    if (!acc[img.vehicleId]) acc[img.vehicleId] = [];
    acc[img.vehicleId].push(img.path);
    return acc;
  }, {});

  // Attach images to each vehicle
  return vehicles.map(v => ({
    ...v,
    mainImage: imageMap[v.id]?.[0] || null,
    allImages: imageMap[v.id] || []
  }));
}

/**
 * Get a single vehicle by ID with its images
 */
export async function getVehicleById(id) {
  const [vehicleRows] = await pool.query('SELECT * FROM vehicles WHERE id = ?', [id]);
  if (vehicleRows.length === 0) return null;
  const vehicle = vehicleRows[0];

  const [images] = await pool.query(
    'SELECT * FROM vehicle_images WHERE vehicleId = ? ORDER BY `order` ASC',
    [id]
  );
  vehicle.images = images;
  return vehicle;
}

//Home page
export async function getHomeCars() {
  // Fetch latest 8 available cars
  const [all] = await pool.query(
    "SELECT * FROM vehicles WHERE status = 'Available' ORDER BY createdAt DESC LIMIT 8"
  );

  // Container cars (vehicleLicense = 'No')
  const [container] = await pool.query(
    "SELECT * FROM vehicles WHERE status = 'Available' AND steering = 'Right' ORDER BY createdAt DESC LIMIT 8"
  );

  // Licensed cars (vehicleLicense = 'Yes')
  const [licensed] = await pool.query(
    "SELECT * FROM vehicles WHERE status = 'Available' AND steering = 'Left' ORDER BY createdAt DESC LIMIT 8"
  );

  // Collect all vehicle IDs to fetch images in one go
  const vehicleIds = [...all, ...container, ...licensed].map(v => v.id);
  if (vehicleIds.length === 0) {
    return { all: [], container: [], licensed: [] };
  }

  const [images] = await pool.query(
    'SELECT vehicleId, path FROM vehicle_images WHERE vehicleId IN (?) ORDER BY `order` ASC',
    [vehicleIds]
  );

  // Build image map
  const imageMap = images.reduce((acc, img) => {
    if (!acc[img.vehicleId]) acc[img.vehicleId] = [];
    acc[img.vehicleId].push(img.path);
    return acc;
  }, {});

  const mapVehicle = (v) => ({
    ...v,
    images: imageMap[v.id] || []
  });

  return {
    all: all.map(mapVehicle),
    container: container.map(mapVehicle),
    licensed: licensed.map(mapVehicle)
  };
}

// Carousel Fetch
export async function getCarouselItems() {
  const [rows] = await pool.query('SELECT * FROM carousel_items ORDER BY createdAt DESC LIMIT 5');
  return rows;
}

// Testimonials Fetch
export async function getTestimonials(lang = 'en') {
  const tableName = `testimonial_${lang}`;
  const [rows] = await pool.query(`SELECT * FROM ?? ORDER BY createdAt DESC LIMIT 5`, [tableName]);
  return rows;
}

// Video Fetch
export async function getChooseVideo() {
  const [rows] = await pool.query('SELECT * FROM choose_videos ORDER BY createdAt DESC LIMIT 1');
  return rows[0] || null;
}