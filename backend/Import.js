// Contoh endpoint Express.js
app.post('/import/material', async (req, res) => {
    try {
      const materials = req.body;
      // Proses dan simpan data ke database
      // Misalnya:
      await MaterialModel.bulkWrite(
        materials.map(material => ({
          updateOne: {
            filter: { id: material.id },
            update: material,
            upsert: true, // Jika tidak ada, buat baru
          },
        }))
      );
      res.status(200).send('Materials imported successfully');
    } catch (error) {
      console.error('Error importing materials:', error);
      res.status(500).send('Failed to import materials');
    }
  });
  