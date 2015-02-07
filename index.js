/**
 * Copyright (C) 2015 Joe Bandenburg
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

var curve25519 = require("axolotl-crypto-curve25519");
var crypto = require("crypto");

var toBuffer = function(arrayBuffer) {
    var buffer = new Buffer(arrayBuffer.byteLength);
    var view = new Uint8Array(arrayBuffer);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
};

var toArrayBuffer = function(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
};

module.exports = {
    generateKeyPair: function() {
        var privateKey = toArrayBuffer(crypto.randomBytes(32));
        var pair = curve25519.generateKeyPair(privateKey);
        var publicKey = new Uint8Array(33);
        publicKey[0] = 0x05;
        publicKey.set(new Uint8Array(pair.public), 1);
        return {
            public: publicKey.buffer,
            private: pair.private
        };
    },
    calculateAgreement: function(publicKey, privateKey) {
        return curve25519.calculateAgreement(publicKey.slice(1), privateKey);
    },
    randomBytes: function(byteCount) {
        return toArrayBuffer(crypto.randomBytes(byteCount));
    },
    sign: function(privateKey, dataToSign) {
        return curve25519.sign(privateKey, dataToSign);
    },
    verifySignature: function(signerPublicKey, dataToSign, purportedSignature) {
        return curve25519.verifySignature(signerPublicKey.slice(1), dataToSign, purportedSignature);
    },
    hmac: function(key, data) {
        var hmac = crypto.createHmac("sha256", toBuffer(key));
        hmac.update(toBuffer(data));
        return toArrayBuffer(hmac.digest());
    },
    encrypt: function(key, message, iv) {
        var cipher = crypto.createCipheriv("aes-256-cbc", toBuffer(key), toBuffer(iv));
        var buffer1 = cipher.update(toBuffer(message));
        var buffer2 = cipher.final();
        return toArrayBuffer(Buffer.concat([buffer1, buffer2]));
    },
    decrypt: function(key, ciphertext, iv) {
        var cipher = crypto.createDecipheriv("aes-256-cbc", toBuffer(key), toBuffer(iv));
        var buffer1 = cipher.update(toBuffer(ciphertext));
        var buffer2 = cipher.final();
        return toArrayBuffer(Buffer.concat([buffer1, buffer2]));
    }
};
