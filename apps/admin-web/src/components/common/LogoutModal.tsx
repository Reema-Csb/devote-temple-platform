"use client";

export default function LogoutModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-[24px] shadow-lg p-8 text-center">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-500 text-3xl">!</span>
        </div>

        <h2 className="text-[22px] font-semibold text-[#1d140d]">
          Are you sure?
        </h2>

        <p className="mt-3 text-[14px] text-[#7d6746] leading-6">
          You will be logged out of your Devote account. You will need to login
          again to make offerings.
        </p>

        <div className="mt-8 space-y-4">
          <button
            onClick={onConfirm}
            className="w-full h-[48px] bg-red-500 text-white rounded-[12px] font-semibold"
          >
            Logout
          </button>

          <button
            onClick={onClose}
            className="w-full h-[48px] border border-[#ccb28a] text-[#9c7a50] rounded-[12px] font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
