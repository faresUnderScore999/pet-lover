const { pool } = require("../db");
const bcrypt = require("bcryptjs");

async function run() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("Starting sample data seed...");

    // ---------- USERS ----------
    const userData = [
      { email: "citizen@tunis.tn", role: "citizen", full_name: "Leila Ben Ammar", city: "Tunis", phone: "+216 20 123 456" },
      { email: "citizen@sfax.tn", role: "citizen", full_name: "Khalid Gharbi", city: "Sfax", phone: "+216 74 234 567" },
      { email: "citizen@sousse.tn", role: "citizen", full_name: "Fatma Trabelsi", city: "Sousse", phone: "+216 73 345 678" },
      { email: "rescuer@tunis.tn", role: "rescuer", full_name: "Omar Cherif", city: "Tunis", phone: "+216 22 456 789" },
      { email: "rescuer@sfax.tn", role: "rescuer", full_name: "Nadia Mansour", city: "Sfax", phone: "+216 24 567 890" },
      { email: "rescuer@sousse.tn", role: "rescuer", full_name: "Samir Jaziri", city: "Sousse", phone: "+216 26 678 901" },
      { email: "vet@sfax.tn", role: "vet", full_name: "Dr. Youssef Khamsi", city: "Sfax", phone: "+216 75 789 012" },
      { email: "assoc@sousse.tn", role: "association", full_name: "Sousse Animal Rescue", city: "Sousse", phone: "+216 73 890 123" },
    ];

    const userIds = {};
    for (const u of userData) {
      const existing = await client.query("SELECT id FROM users WHERE email = $1", [u.email]);
      if (existing.rows.length > 0) {
        userIds[u.email] = existing.rows[0].id;
        continue;
      }
      const hash = await bcrypt.hash("Demo123!", 10);
      const res = await client.query(
        `INSERT INTO users (email, password_hash, role, full_name, phone, city, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id`,
        [u.email, hash, u.role, u.full_name, u.phone, u.city]
      );
      userIds[u.email] = res.rows[0].id;
    }
    console.log("Users seeded:", Object.keys(userIds).length + " (including existing)");

    // ---------- INCIDENT REPORTS ----------
    const incidents = [
      { type: "stray_pack", lat: 36.8065, lng: 10.1815, desc: "Pack of 6 stray dogs near Avenue Habib Bourguiba, Tunis city center", sev: "high", status: "pending", reporter: "citizen@tunis.tn" },
      { type: "injured_animal", lat: 36.8523, lng: 10.3220, desc: "Injured dog with limp near Carthage ruins", sev: "critical", status: "verified", reporter: "rescuer@tunis.tn" },
      { type: "trash_bin", lat: 36.8789, lng: 10.3285, desc: "Overflowing open trash bin attracting street cats in La Marsa", sev: "medium", status: "pending", reporter: "citizen@tunis.tn" },
      { type: "unleashed_pet", lat: 36.8021, lng: 10.1798, desc: "Unleashed large dog in public park, Sidi Bou Said", sev: "low", status: "resolved", reporter: "citizen@tunis.tn" },
      { type: "abandonment", lat: 34.7406, lng: 10.7604, desc: "Litter of puppies abandoned near Sfax city center", sev: "high", status: "pending", reporter: "rescuer@sfax.tn" },
      { type: "stray_pack", lat: 34.7360, lng: 10.7450, desc: "Pack of 4 dogs near Sfax railway station", sev: "medium", status: "pending", reporter: "citizen@sfax.tn" },
      { type: "injured_animal", lat: 35.8256, lng: 10.6356, desc: "Injured cat with visible wound on Sousse corniche", sev: "high", status: "verified", reporter: "rescuer@sousse.tn" },
      { type: "trash_bin", lat: 35.8260, lng: 10.6300, desc: "Unsecured municipal waste bin in Sousse medina", sev: "medium", status: "dismissed", reporter: "citizen@sousse.tn" },
      { type: "abandonment", lat: 36.8050, lng: 10.1800, desc: "Adult cat abandoned in Tunis residential area", sev: "medium", status: "pending", reporter: "citizen@tunis.tn" },
      { type: "stray_pack", lat: 35.8300, lng: 10.6400, desc: "Pack of 5 dogs near Sousse port area", sev: "high", status: "pending", reporter: "rescuer@sousse.tn" },
    ];

    const incidentIds = [];
    for (const inc of incidents) {
      const res = await client.query(
        `INSERT INTO incident_reports (reporter_id, type, latitude, longitude, description, severity, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [userIds[inc.reporter], inc.type, inc.lat, inc.lng, inc.desc, inc.sev, inc.status]
      );
      incidentIds.push(res.rows[0].id);
    }
    console.log("Incidents seeded:", incidents.length);

    // ---------- SAFETY FLAGS ----------
    const flags = [
      { type: "active_pack", lat: 36.8065, lng: 10.1815, radius: 150, reporter: "citizen@tunis.tn" },
      { type: "unlit_area", lat: 34.7406, lng: 10.7604, radius: 200, reporter: "rescuer@sfax.tn" },
      { type: "safe_zone", lat: 35.8256, lng: 10.6356, radius: 100, reporter: "citizen@sousse.tn" },
      { type: "active_pack", lat: 35.8300, lng: 10.6400, radius: 120, reporter: "rescuer@sousse.tn" },
      { type: "unlit_area", lat: 36.8523, lng: 10.3220, radius: 180, reporter: "rescuer@tunis.tn" },
    ];

    for (const f of flags) {
      await client.query(
        `INSERT INTO safety_flags (type, latitude, longitude, radius_meters, reported_by, expires_at)
         VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')`,
        [f.type, f.lat, f.lng, f.radius, userIds[f.reporter]]
      );
    }
    console.log("Safety flags seeded:", flags.length);

    // ---------- ANIMALS ----------
    const animals = [
      { name: "Whiskers", species: "cat", age: "2 years", gender: "female", health: "healthy", ster: true, vac: true, loc: "Tunis - Medina", lat: 36.8000, lng: 10.1700, photos: ["https://images.unsplash.com/photo-1514888286973-4696682e8768?w=400"], desc: "Sweet rescued kitten looking for a loving home. Vaccinated and sterilized.", status: "available", lister: "rescuer@tunis.tn" },
      { name: "Buddy", species: "dog", age: "1 year", gender: "male", health: "healthy", ster: false, vac: true, loc: "Sfax - City Center", lat: 34.7406, lng: 10.7604, photos: ["https://images.unsplash.com/photo-1552053831-71594a27632d?w=400"], desc: "Friendly young dog, good with children. Needs a foster home.", status: "available", lister: "rescuer@sfax.tn" },
      { name: "Luna", species: "cat", age: "6 months", gender: "female", health: "recovering", ster: false, vac: false, loc: "Sousse - Corniche", lat: 35.8256, lng: 10.6356, photos: ["https://images.unsplash.com/photo-1593145789820-8659e71e81a4?w=400"], desc: "Rescued from street, currently recovering from minor injury.", status: "fostered", lister: "rescuer@sousse.tn" },
      { name: "Max", species: "dog", age: "3 years", gender: "male", health: "healthy", ster: true, vac: true, loc: "Tunis - Carthage", lat: 36.8523, lng: 10.3220, photos: ["https://images.unsplash.com/photo-1545304274-9e665095973e?w=400"], desc: "Calm and well-trained adult dog. Ready for adoption.", status: "available", lister: "assoc@tunis.tn" },
      { name: "Mimi", species: "cat", age: "1 year", gender: "female", health: "healthy", ster: true, vac: true, loc: "Sfax - Railway Station", lat: 34.7360, lng: 10.7450, photos: ["https://images.unsplash.com/photo-1517895387370-399573434009?w=400"], desc: "Playful kitten, good with other cats.", status: "adopted", lister: "rescuer@sfax.tn" },
      { name: "Simba", species: "dog", age: "4 years", gender: "male", health: "healthy", ster: true, vac: true, loc: "Sousse - Medina", lat: 35.8260, lng: 10.6300, photos: ["https://images.unsplash.com/photo-1561140037-691924770632?w=400"], desc: "Gentle large dog, looking for a quiet home.", status: "available", lister: "assoc@sousse.tn" },
      { name: "Bella", species: "cat", age: "8 months", gender: "female", health: "healthy", ster: false, vac: true, loc: "Tunis - La Marsa", lat: 36.8789, lng: 10.3285, photos: ["https://images.unsplash.com/photo-1567548773178-d8732273000f?w=400"], desc: "Curious and energetic young cat.", status: "available", lister: "citizen@tunis.tn" },
      { name: "Rocky", species: "dog", age: "2 years", gender: "male", health: "healthy", ster: false, vac: false, loc: "Sfax - Port", lat: 34.7300, lng: 10.7500, photos: ["https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400"], desc: "Strong young dog, needs experienced owner.", status: "available", lister: "rescuer@sfax.tn" },
    ];

    const animalIds = [];
    for (const a of animals) {
      const res = await client.query(
        `INSERT INTO animals (listed_by_id, name, species, age, gender, health_status, sterilized, vaccinated, location, latitude, longitude, photos, description, adoption_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id`,
        [userIds[a.lister], a.name, a.species, a.age, a.gender, a.health, a.ster, a.vac, a.loc, a.lat, a.lng, JSON.stringify(a.photos), a.desc, a.status]
      );
      animalIds.push(res.rows[0].id);
    }
    console.log("Animals seeded:", animals.length);

    // ---------- TNR CASES ----------
    const tnrCases = [
      { animal: animalIds[0], rescuer: "rescuer@tunis.tn", assoc: "assoc@tunis.tn", vet: "vet@animal.tn", status: "completed", cost: 120.00, notes: "Sterilization + rabies vaccination completed" },
      { animal: animalIds[1], rescuer: "rescuer@sfax.tn", assoc: null, vet: "vet@sfax.tn", status: "scheduled", cost: 150.00, notes: "Sterilization scheduled for next week" },
      { animal: animalIds[3], rescuer: "assoc@tunis.tn", assoc: "assoc@tunis.tn", vet: "vet@animal.tn", status: "requested", cost: 100.00, notes: "Awaiting vet availability" },
      { animal: animalIds[5], rescuer: "assoc@sousse.tn", assoc: "assoc@sousse.tn", vet: null, status: "requested", cost: 110.00, notes: "Needs vet assignment" },
      { animal: animalIds[7], rescuer: "rescuer@sfax.tn", assoc: null, vet: "vet@sfax.tn", status: "cancelled", cost: 0.00, notes: "Owner reclaimed animal" },
    ];

    const tnrIds = [];
    for (const t of tnrCases) {
      const res = await client.query(
        `INSERT INTO tnr_cases (animal_id, rescuer_id, association_id, vet_id, status, procedure_date, estimated_cost, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [t.animal, userIds[t.rescuer], t.assoc ? userIds[t.assoc] : null, t.vet ? userIds[t.vet] : null, t.status, t.status === "completed" ? new Date(Date.now() - 86400000).toISOString() : null, t.cost, t.notes]
      );
      tnrIds.push(res.rows[0].id);
    }
    console.log("TNR cases seeded:", tnrCases.length);

    // ---------- DONATIONS ----------
    const donations = [
      { tnr: tnrIds[0], animal: null, donor: "citizen@tunis.tn", amount: 50.00, msg: "Supporting Whiskers' care" },
      { tnr: tnrIds[1], animal: null, donor: "citizen@sfax.tn", amount: 100.00, msg: "Help Buddy's surgery" },
      { tnr: tnrIds[0], animal: null, donor: "citizen@sousse.tn", amount: 25.00, msg: "Small contribution" },
      { tnr: null, animal: animalIds[3], donor: "rescuer@tunis.tn", amount: 200.00, msg: "Max's medical fund" },
      { tnr: tnrIds[2], animal: null, donor: "assoc@tunis.tn", amount: 75.00, msg: "Association support" },
    ];

    for (const d of donations) {
      await client.query(
        `INSERT INTO donations (tnr_case_id, animal_id, donor_id, amount, currency, message)
         VALUES ($1, $2, $3, $4, 'TND', $5)`,
        [d.tnr, d.animal, userIds[d.donor], d.amount, d.msg]
      );
    }
    console.log("Donations seeded:", donations.length);

    // ---------- CLEAN-UP INITIATIVES ----------
    const cleanups = [
      { title: "Medina Beach Clean-up", desc: "Weekend clean-up at Sousse beach to reduce waste attracting animals", loc: "Sousse Beach", lat: 35.8256, lng: 10.6356, date: new Date(Date.now() + 7 * 86400000).toISOString(), needed: 15, joined: 8, status: "planned", org: "rescuer@sousse.tn" },
      { title: "Tunis City Center Waste Drive", desc: "Community clean-up of open waste bins in Tunis center", loc: "Tunis Center", lat: 36.8065, lng: 10.1815, date: new Date(Date.now() + 14 * 86400000).toISOString(), needed: 20, joined: 12, status: "planned", org: "citizen@tunis.tn" },
      { title: "Sfax Port Area Clean-up", desc: "Cleaned up waste around port area", loc: "Sfax Port", lat: 34.7300, lng: 10.7500, date: new Date(Date.now() - 5 * 86400000).toISOString(), needed: 10, joined: 10, status: "completed", org: "rescuer@sfax.tn" },
    ];

    for (const c of cleanups) {
      await client.query(
        `INSERT INTO clean_up_initiatives (organizer_id, title, description, location, latitude, longitude, event_date, volunteers_needed, volunteers_joined, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [userIds[c.org], c.title, c.desc, c.loc, c.lat, c.lng, c.date, c.needed, c.joined, c.status]
      );
    }
    console.log("Clean-up initiatives seeded:", cleanups.length);

    // ---------- WASTE BINS ----------
    const bins = [
      { lat: 36.8065, lng: 10.1815, secure: true, reporter: "citizen@tunis.tn", notes: "Closed lid, well-maintained" },
      { lat: 36.8789, lng: 10.3285, secure: false, reporter: "citizen@tunis.tn", notes: "Open lid, attracts cats" },
      { lat: 34.7406, lng: 10.7604, secure: true, reporter: "rescuer@sfax.tn", notes: "Secure municipal bin" },
      { lat: 34.7300, lng: 10.7500, secure: false, reporter: "rescuer@sfax.tn", notes: "Damaged lid, food accessible" },
      { lat: 35.8256, lng: 10.6356, secure: true, reporter: "citizen@sousse.tn", notes: "New secure bin installed" },
      { lat: 35.8300, lng: 10.6400, secure: false, reporter: "rescuer@sousse.tn", notes: "Overflowing, needs replacement" },
      { lat: 36.8523, lng: 10.3220, secure: true, reporter: "rescuer@tunis.tn", notes: "Well secured, Carthage area" },
    ];

    for (const b of bins) {
      await client.query(
        `INSERT INTO waste_bins (latitude, longitude, is_secure, reported_by, notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [b.lat, b.lng, b.secure, userIds[b.reporter], b.notes]
      );
    }
    console.log("Waste bins seeded:", bins.length);

    await client.query("COMMIT");
    console.log("Sample data seed completed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

run();