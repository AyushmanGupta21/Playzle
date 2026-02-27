import { useEffect, useState } from 'react';
import api from '../api/client';
import { useGameStore } from '../store/gameStore';
import styles from './Shop.module.css';
import { v4 as uuidv4 } from 'uuid';

interface ShopItem {
    id: string;
    name: string;
    type: 'skin' | 'clothing';
    cost: number;
    image_url: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const RARITY_EMOJI: Record<string, string> = {
    common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡',
};

export default function ShopPage() {
    const { user, inventory, updateCoins, setInventory } = useGameStore();
    const [items, setItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'skin' | 'clothing'>('all');

    useEffect(() => {
        api.get('/economy/items').then((res: { data: { items: ShopItem[] } }) => setItems(res.data.items)).finally(() => setLoading(false));
        api.get('/economy/inventory').then((res: { data: { items: import('../store/gameStore').InventoryItem[] } }) => setInventory(res.data.items));
    }, [setInventory]);

    const ownedIds = new Set(inventory.map((item: { id: string }) => item.id));
    const filteredItems = items.filter((i) => activeTab === 'all' || i.type === activeTab);

    const handlePurchase = async (item: ShopItem) => {
        if (!user || user.coins < item.cost) {
            setMessage({ type: 'error', text: `Not enough coins! You need ${item.cost - (user?.coins ?? 0)} more. 🪙` });
            return;
        }
        setPurchasing(item.id);
        setMessage(null);
        try {
            const res = await api.post('/economy/purchase', {
                itemId: item.id,
                idempotencyKey: uuidv4(), // fresh UUID per purchase attempt
            });
            updateCoins(res.data.newBalance);
            const invRes = await api.get('/economy/inventory');
            setInventory(invRes.data.items);
            setMessage({ type: 'success', text: `🎉 ${item.name} is now yours!` });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.error || 'Purchase failed' });
        } finally {
            setPurchasing(null);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={`${styles.title} pixel-font`}>⚔️ THE BAZAAR</h1>
                    <p className={styles.subtitle}>Customize your hero with rare skins and clothing</p>
                </div>
                <div className="coin-badge" style={{ fontSize: '18px', padding: '10px 20px' }}>
                    🪙 {user?.coins.toLocaleString() ?? 0}
                </div>
            </div>

            {message && (
                <div className={`${styles.toast} ${message.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.tabs}>
                {(['all', 'skin', 'clothing'] as const).map((tab) => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'all' ? '🛒 All' : tab === 'skin' ? '🎭 Skins' : '👕 Clothing'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>⏳ Loading items…</div>
            ) : (
                <div className={styles.grid}>
                    {filteredItems.map((item) => {
                        const owned = ownedIds.has(item.id);
                        return (
                            <div key={item.id} className={`${styles.itemCard} rarity-${item.rarity} ${owned ? styles.owned : ''}`}>
                                <div className={styles.rarityBadge}>
                                    {RARITY_EMOJI[item.rarity]} {item.rarity}
                                </div>
                                <div className={styles.itemImage}>
                                    {item.type === 'skin' ? '🧙' : '👘'}
                                </div>
                                <div className={styles.itemInfo}>
                                    <h3 className={styles.itemName}>{item.name}</h3>
                                    <p className={styles.itemDesc}>{item.description}</p>
                                </div>
                                <div className={styles.itemFooter}>
                                    <span className="coin-badge">🪙 {item.cost.toLocaleString()}</span>
                                    {owned ? (
                                        <span className={styles.ownedTag}>✅ Owned</span>
                                    ) : (
                                        <button
                                            className="btn btn-gold"
                                            onClick={() => handlePurchase(item)}
                                            disabled={purchasing === item.id || (user?.coins ?? 0) < item.cost}
                                        >
                                            {purchasing === item.id ? '⏳' : 'Buy'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
