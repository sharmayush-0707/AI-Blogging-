import React, { useState } from 'react';
import { Coffee, Heart, X, Check, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { tipAuthor } from '../services/api';

export default function TipAuthorModal({ authorName = 'Alex Mercer', onClose, onTipSuccess }) {
  const [selectedAmount, setSelectedAmount] = useState(5);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const presets = [3, 5, 10, 20];

  const handleSendTip = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (!finalAmount || finalAmount <= 0) return;

    setLoading(true);
    try {
      await tipAuthor(finalAmount, message || 'Thank you for this valuable article!', authorName);
      setSuccess(true);

      // Trigger Confetti explosion
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onTipSuccess) onTipSuccess(finalAmount);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      alert('Could not process tip: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-left">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/40">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Tip Received with Gratitude!</h3>
            <p className="text-slate-400 text-sm">
              Your support goes directly to <span className="text-white font-medium">{authorName}</span>.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Buy {authorName} a Coffee</h3>
                <p className="text-xs text-slate-400">Support independent technical writing</p>
              </div>
            </div>

            {/* Presets */}
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Amount:
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {presets.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                    !customAmount && selectedAmount === amt
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="relative mb-4">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="Or enter custom amount ($)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Message */}
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Add a friendly note:
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Thanks for the breakdown on React 19 SSR!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 mb-6"
            />

            {/* Submit */}
            <button
              onClick={handleSendTip}
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              <span>
                {loading ? 'Processing...' : `Send $${customAmount || selectedAmount} Micro-Tip`}
              </span>
            </button>
          </>
        )}

      </div>
    </div>
  );
}
