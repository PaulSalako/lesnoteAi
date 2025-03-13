// src/dashboard/components/BuyTokensModal/BuyTokensModal.jsx
import React, { useState } from 'react';
import './BuyTokensModal.css';

function BuyTokensModal({ isOpen, onClose, userEmail = "user@example.com" }) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const tokenPlans = [
    {
      id: 1,
      totalTokens: 110,
      baseTokens: 100,
      bonusTokens: 10,
      price: 10
    },
    {
      id: 2,
      totalTokens: 550,
      baseTokens: 500,
      bonusTokens: 50,
      price: 45,
      isPopular: true
    },
    {
      id: 3,
      totalTokens: 1150,
      baseTokens: 1000,
      bonusTokens: 150,
      price: 80
    }
  ];

  const handlePayment = () => {
    if (!selectedPlan) return;

    setIsProcessing(true);

    // Initialize Paystack payment
    const handler = window.PaystackPop.setup({
      key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your Paystack public key
      email: userEmail,
      amount: selectedPlan.price * 100, // Amount in kobo
      currency: 'NGN',
      ref: 'tok_' + Math.random().toString(36).substr(2, 9),
      callback: function(response) {
        // Handle successful payment
        handleSuccessfulPayment(response);
      },
      onClose: function() {
        setIsProcessing(false);
      }
    });

    handler.openIframe();
  };

  const handleSuccessfulPayment = async (response) => {
    try {
      // Call your backend API to verify payment and credit tokens
      const apiResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reference: response.reference,
          tokens: selectedPlan.totalTokens
        })
      });

      if (apiResponse.ok) {
        // Show success message and close modal
        alert('Payment successful! Tokens have been credited.');
        onClose();
      } else {
        throw new Error('Failed to verify payment');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      alert('Error verifying payment. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="token-modal-overlay" onClick={onClose}>
      <div className="token-modal" onClick={e => e.stopPropagation()}>
        <div className="token-modal-header">
          <h2>Buy More Tokens</h2>
          <button className="close-modal" onClick={onClose}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="token-modal-content">
          <div className="token-plans-grid">
            {tokenPlans.map((plan) => (
              <div 
                key={plan.id} 
                className={`token-plan ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(plan)}
              >
                <div className="token-plan-amount">
                  {plan.totalTokens}
                  <span className="token-label">tokens</span>
                </div>
                {plan.isPopular && <div className="popular-tag">Most Popular</div>}
                <div className="token-plan-breakdown">
                  {plan.baseTokens} tokens+{plan.bonusTokens} bonus
                </div>
                <div className="token-plan-price">
                  ${plan.price}
                </div>
              </div>
            ))}
          </div>

          <div className="token-purchase-footer">
            {!selectedPlan ? (
              <div className="plan-selection-text">
                Select a plan to continue
              </div>
            ) : (
              <div className="selected-plan-summary">
                Selected: {selectedPlan.totalTokens} tokens for ${selectedPlan.price}
              </div>
            )}
            
            <button 
              className="select-plan-btn"
              disabled={!selectedPlan || isProcessing}
              onClick={handlePayment}
            >
              {isProcessing ? (
                <span className="loading-spinner">Processing...</span>
              ) : selectedPlan ? (
                `Pay $${selectedPlan.price}`
              ) : (
                'Select a Plan'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuyTokensModal;