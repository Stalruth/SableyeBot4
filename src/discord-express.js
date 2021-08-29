'use strict';

const nacl = require('tweetnacl');
const express = require('express');

function signatureMiddleware(publicKey) {
  return (req, res, buf, encoding) => {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const body = buf.toString(encoding);

    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(publicKey, 'hex'));

    if(!isVerified) throw 'Signature check failed.';
    console.log(body);
  };
}

function ping(req, res) {
  res.json({type: 1});
}

function setupApplication(app, publicKey, route, handlers) {
  const verifySignature = signatureMiddleware(publicKey);

  app.use(route, express.json({verify: verifySignature}));

  app.post(route, (req, res) => {
    const handler = handlers[req.body['type'] - 1] ?? (() => {});
    handler(req, res);
  });
}

module.exports = { signatureMiddleware, setupApplication, ping };
