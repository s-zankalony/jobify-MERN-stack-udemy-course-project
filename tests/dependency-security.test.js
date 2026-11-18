import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import upload, { formatImage } from '../middleware/multerMiddleware.js';

test('avatar conversion preserves bytes and detects each file type independently', () => {
  const buffer = Buffer.from([0, 1, 255]);
  for (const [extension, mime] of [['png', 'image/png'], ['jpg', 'image/jpeg'], ['gif', 'image/gif']]) {
    assert.equal(formatImage({ originalname: `avatar.${extension}`, buffer }), `data:${mime};base64,AAH/`);
  }
});

test('Cloudinary retains the v2 APIs used by the application', () => {
  assert.equal(typeof cloudinary.config, 'function');
  assert.equal(typeof cloudinary.v2.uploader.upload, 'function');
  assert.equal(typeof cloudinary.v2.uploader.destroy, 'function');
});

test('countDocuments sanitizes operator injection and preserves a legitimate filter', async () => {
  const Model = mongoose.model('DependencySecurityTest', new mongoose.Schema({ name: String }));
  Model.collection.countDocuments = async (filter) => {
    assert.equal(filter.name, 'ordinary');
    return 1;
  };
  assert.equal(await Model.countDocuments({ name: 'ordinary' }).setOptions({ sanitizeFilter: true }), 1);
  for (const payload of [{ $ne: null }, { $regex: '.*' }]) {
    await assert.rejects(Model.countDocuments({ name: payload }).setOptions({ sanitizeFilter: true }).exec(), /Cast to string failed/);
  }
  mongoose.deleteModel('DependencySecurityTest');
});

test('avatar middleware accepts normal uploads and rejects malformed multipart requests', async () => {
  const app = express();
  app.post('/', upload.single('avatar'), (req, res) => res.json({ size: req.file?.size, name: req.file?.originalname }));
  app.use((err, req, res, next) => res.status(400).json({ error: err.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}`;
  try {
    const form = new FormData();
    form.append('avatar', new Blob(['avatar-bytes'], { type: 'image/png' }), 'avatar.png');
    const good = await fetch(url, { method: 'POST', body: form });
    assert.equal(good.status, 200);
    assert.deepEqual(await good.json(), { size: 12, name: 'avatar.png' });
    for (const headers of [{ 'Content-Type': 'multipart/form-data' }, { 'Content-Type': 'multipart/form-data; boundary=broken' }]) {
      const bad = await fetch(url, { method: 'POST', headers, body: 'invalid multipart body' });
      assert.equal(bad.status, 400);
    }
    const next = new FormData();
    next.append('avatar', new Blob(['ok']), 'ok.png');
    assert.equal((await fetch(url, { method: 'POST', body: next })).status, 200);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
