
import * as CryptoJS from 'crypto-js';

// src/app/common/export-functions/customfunctions.ts
export function hasError(form: any, controlName: string, errorName: string): boolean {
    return form.controls[controlName].hasError(errorName);
  }
  
  export function LocalStorageClear():void{
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId'); 
    localStorage.removeItem('activities');
    localStorage.clear();
  }

const Valueway1 = "315950mgbfyf7484";
const SafetyVI = "545687ghklmn1924";

export function encryptText(text: string): string {
  const key = CryptoJS.enc.Utf8.parse(Valueway1);
  const iv = CryptoJS.enc.Utf8.parse(SafetyVI);

  const encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text), key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

export function decryptText(encString: string): string {
  const key = CryptoJS.enc.Utf8.parse(Valueway1);
  const iv = CryptoJS.enc.Utf8.parse(SafetyVI);

  const decrypted = CryptoJS.AES.decrypt(encString, key, {
    keySize: 128 / 8,
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}