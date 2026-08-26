const fs = require('fs');

let content = fs.readFileSync('api/index.js', 'utf8');

const uploadEndpoint = `
// POST /api/admin/get-upload-url
app.post('/api/admin/get-upload-url', authenticateJWT, requireRole(['OWNER', 'ADMIN']), async (req, res) => {
  try {
    const { fileName, folder } = req.body;
    if (!fileName || !folder) return res.status(400).json({ error: 'fileName y folder son requeridos' });

    // Asegurar que el bucket exista (si no existe, lo crea y lo hace publico)
    const { data: buckets } = await supabase.storage.listBuckets();
    const publicBucketExists = buckets?.find(b => b.name === 'melofilia_public');
    
    if (!publicBucketExists) {
      await supabase.storage.createBucket('melofilia_public', { public: true });
    }

    const path = \`\${folder}/\${Date.now()}-\${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}\`;
    
    const { data, error } = await supabase.storage.from('melofilia_public').createSignedUploadUrl(path);
    
    if (error) {
      console.error('Error createSignedUploadUrl:', error);
      return res.status(500).json({ error: 'Error al generar URL de subida.' });
    }

    res.json({
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      // La URL pública siempre será esta:
      publicUrl: \`\${process.env.SUPABASE_URL}/storage/v1/object/public/melofilia_public/\${data.path}\`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});
`;

if (!content.includes('/api/admin/get-upload-url')) {
  // Insert before the error handling middleware
  content = content.replace('// Manejo de errores global', uploadEndpoint + '\n// Manejo de errores global');
  fs.writeFileSync('api/index.js', content);
  console.log("Backend updated successfully.");
} else {
  console.log("Backend already updated.");
}
