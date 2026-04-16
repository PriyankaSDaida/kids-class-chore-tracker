import React, { useState } from 'react';
import { ShoppingBag, Lock, Plus, Trash2, Check, Star, Settings } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../ui/Toast';
import PinPad from '../chores/PinPad';
import type { ShopItem, ShopItemType } from '../../store/types';

const ShopBoard: React.FC = () => {
  const {
    shopItems, shopPurchases, children, activeChildFilter,
    buyShopItem, fulfillPurchase, addShopItem, deleteShopItem, choreSettings, theme
  } = useAppStore();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'shop' | 'pin' | 'manage'>('shop');
  const [showAdd, setShowAdd] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCost, setNewItemCost] = useState('');
  const [newItemType, setNewItemType] = useState<ShopItemType>('points');
  const [newItemIcon, setNewItemIcon] = useState('🎁');

  const activeChild = children.find(c => c.id === activeChildFilter) || children[0];

  const handleBuy = (item: ShopItem) => {
    if (!activeChild) { showToast('Select a child first', 'error'); return; }
    const success = buyShopItem(activeChild.id, item.id);
    if (success) {
      showToast(`Bought ${item.name}! 🎉`, 'success');
      if (choreSettings.soundCelebrations) {
        // play a ka-ching or small fanfare natively via generic web audio if we had one here (simplifying for now)
      }
    } else {
      showToast(`Not enough ${item.type}! 💔`, 'error');
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemCost) return;
    addShopItem({
      id: `shop-item-${Date.now()}`,
      name: newItemName,
      cost: parseInt(newItemCost, 10),
      type: newItemType,
      icon: newItemIcon
    });
    setNewItemName(''); setNewItemCost(''); setShowAdd(false);
    showToast('Item added!', 'success');
  };

  return (
    <div className="page-content" id="screen-shop" style={{ maxWidth: 900 }}>
      {/* ── Header ── */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 24, flexWrap: 'wrap', gap: 16
      }}>
        <div>
          <h1 style={{ fontWeight: 900, fontFamily: 'Nunito, sans-serif', fontSize: '2.4rem', margin: 0, display: 'flex', alignItems:'center', gap: 12 }}>
            <ShoppingBag size={32} color="var(--accent)" />
            Reward Shop
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)' }}>
            Trade your hard-earned points and tokens for real-world rewards!
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {activeChild && mode === 'shop' && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:'1.2rem' }}>⭐</span>
                <span style={{ fontWeight:900 }}>{activeChild.points} pts</span>
              </div>
              <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:'1.2rem' }}>🎮</span>
                <span style={{ fontWeight:900 }}>{activeChild.gameTokens ?? 0}</span>
              </div>
            </div>
          )}
          
          <button
            className={`btn ${mode === 'manage' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => {
              if (mode === 'manage') setMode('shop');
              else if (choreSettings.parentPin) setMode('pin');
              else setMode('manage');
            }}
          >
            {mode === 'manage' ? 'Exit Manage' : <><Settings size={14}/> Manage</>}
          </button>
        </div>
      </header>

      {/* ── PIN Entry ── */}
      {mode === 'pin' && (
        <div style={{ marginTop: 40, maxWidth: 340, margin: '40px auto 0' }}>
          <PinPad
            label="Parent Area"
            subtitle="Enter PIN to manage shop"
            expectedPin={choreSettings.parentPin}
            onConfirm={() => setMode('manage')}
            onCancel={() => setMode('shop')}
          />
        </div>
      )}

      {/* ── Shop Grid ── */}
      {mode === 'shop' && (
        <>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20
          }}>
            {shopItems.map(item => {
              const canAfford = activeChild && (
                item.type === 'points' ? activeChild.points >= item.cost : (activeChild.gameTokens ?? 0) >= item.cost
              );
              
              return (
                <div key={item.id} className="glass-panel hover-card" style={{
                  padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column',
                  background: canAfford ? 'var(--bg-card)' : theme === 'dark' ? 'rgba(30,27,75,0.4)' : '#f8fafc',
                  opacity: canAfford ? 1 : 0.7,
                  border: canAfford ? '1.5px solid var(--accent)' : '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>{item.icon}</div>
                  <h3 style={{ fontWeight: 800, margin: '0 0 8px', fontSize: '1.1rem' }}>{item.name}</h3>
                  
                  <div style={{
                    marginTop: 'auto', marginBottom: 16,
                    fontWeight: 900, color: item.type === 'points' ? '#ecc94b' : '#7C3AED',
                    fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}>
                    {item.type === 'points' ? '⭐' : '🎮'} {item.cost} {item.type}
                  </div>

                  <button
                    className="btn btn-primary"
                    disabled={!canAfford}
                    onClick={() => handleBuy(item)}
                    style={{
                      width: '100%',
                      background: canAfford ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'var(--bg-tertiary)',
                      color: canAfford ? '#fff' : 'var(--text-muted)'
                    }}
                  >
                    {canAfford ? 'Buy Now' : 'Save Up!'}
                  </button>
                </div>
              );
            })}
          </div>

          {shopItems.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
              <h3>The shop is empty</h3>
              <p>Parents can add items in Manage mode!</p>
            </div>
          )}
        </>
      )}

      {/* ── Manage Mode ── */}
      {mode === 'manage' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          
          {/* Fulfill Pending */}
          <section>
            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 16 }}>Pending Redemptions</h2>
            <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
              {shopPurchases.filter(p => !p.isFulfilled).length === 0 ? (
                <div style={{ padding: 24, textAlign:'center', color:'var(--text-muted)' }}>No pending rewards!</div>
              ) : (
                shopPurchases.filter(p => !p.isFulfilled).map(p => {
                  const child = children.find(c => c.id === p.childId);
                  const item = shopItems.find(i => i.id === p.itemId);
                  return (
                    <div key={p.id} style={{
                      padding: '16px 20px', borderBottom: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', gap: 16
                    }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: child?.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
                        {child?.avatarEmoji}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800 }}>{child?.name} wants "{item?.name || 'Unknown Item'}"</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Cost: {p.cost} {p.type} · Purchased: {new Date(p.date).toLocaleDateString()}
                        </div>
                      </div>
                      <button className="btn btn-sm" style={{ background:'var(--green)', color:'#fff' }} onClick={() => fulfillPurchase(p.id)}>
                        <Check size={14}/> Mark Fulfilled
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Edit Items */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0 }}>Shop Inventory</h2>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAdd(!showAdd)}>
                <Plus size={14}/> Add Item
              </button>
            </div>

            {showAdd && (
              <form onSubmit={handleAddSubmit} className="glass-panel" style={{ padding: 20, marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label className="input-label">Reward Name</label>
                  <input type="text" className="input" autoFocus value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="e.g. 1hr iPad Time" required />
                </div>
                <div style={{ width: 100 }}>
                  <label className="input-label">Cost</label>
                  <input type="number" className="input" value={newItemCost} onChange={e => setNewItemCost(e.target.value)} required min={1} />
                </div>
                <div style={{ width: 120 }}>
                  <label className="input-label">Currency</label>
                  <select className="select" value={newItemType} onChange={e => setNewItemType(e.target.value as ShopItemType)}>
                    <option value="points">Points ⭐</option>
                    <option value="tokens">Tokens 🎮</option>
                  </select>
                </div>
                <div style={{ width: 80 }}>
                  <label className="input-label">Emoji</label>
                  <input type="text" className="input" value={newItemIcon} onChange={e => setNewItemIcon(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: 42 }}>Save</button>
              </form>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {shopItems.map(item => (
                <div key={item.id} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16 }}>
                  <div style={{ fontSize: '2rem' }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>{item.cost} {item.type}</div>
                  </div>
                  <button className="btn btn-ghost btn-icon btn-sm" style={{ color: 'var(--red)' }} onClick={() => deleteShopItem(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

    </div>
  );
};

export default ShopBoard;
