"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";

type Props = {
  imageSrc: string;
  onCancel: () => void;
  onSave: (croppedImage: string) => void;
};

type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, crop: Area): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = crop.width;
  canvas.height = crop.height;

  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return canvas.toDataURL("image/jpeg");
}

export default function ProfileImageCropModal({
  imageSrc,
  onCancel,
  onSave,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
    onSave(croppedImage);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="w-[560px] rounded-[28px] bg-white p-6 shadow-2xl">
        <h2 className="mb-5 text-2xl font-semibold text-[#2D1F0E]">
          Crop Profile Image
        </h2>

        <div className="relative h-[400px] overflow-hidden rounded-[24px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-medium text-[#6f5436]">
            Zoom
          </label>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-[#d7c3a4] px-8 py-3 text-[#6f5436]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="rounded-full bg-[#cf6b24] px-8 py-3 font-semibold text-white"
          >
            Save Crop
          </button>
        </div>
      </div>
    </div>
  );
}
