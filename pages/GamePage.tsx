import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ClockIcon, WalletIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, NewspaperIcon, XMarkIcon } from '../components/icons/Icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';


// --- TYPES AND DATA ---
type Stock = {
    id: string;
    name: string;
    type: 'Stock' | 'Mutual Fund';
    price: number;
    volatility: number;
    history: number[];
};

type Holding = {
    stockId: string;
    quantity: number;
    avgBuyPrice: number;
};

type MarketEvent = {
    headline: string;
    targetType: 'stock' | 'sector' | 'market';
    targetId?: string;
    effect: number; // e.g., 1.05 for +5%, 0.98 for -2%
    type: 'positive' | 'negative';
    condition?: (stock: Stock) => boolean;
};

const initialMarketData: Stock[] = [
    { id: 'RELIANCE', name: 'Reliance Industries', type: 'Stock', price: 2950, volatility: 0.03, history: [2950] },
    { id: 'TCS', name: 'Tata Consultancy', type: 'Stock', price: 3850, volatility: 0.025, history: [3850] },
    { id: 'HDFCBANK', name: 'HDFC Bank', type: 'Stock', price: 1530, volatility: 0.02, history: [1530] },
    { id: 'INFY', name: 'Infosys', type: 'Stock', price: 1450, volatility: 0.028, history: [1450] },
    { id: 'NIFTY50', name: 'UTI Nifty 50 Index Fund', type: 'Mutual Fund', price: 180, volatility: 0.015, history: [180] },
    { id: 'PARAG', name: 'Parag Parikh Flexi Cap', type: 'Mutual Fund', price: 75, volatility: 0.02, history: [75] },
    { id: 'AXISBLUE', name: 'Axis Bluechip Fund', type: 'Mutual Fund', price: 58, volatility: 0.018, history: [58] },
    { id: 'TATAMOTORS', name: 'Tata Motors', type: 'Stock', price: 975, volatility: 0.045, history: [975] },
];

const marketEvents: MarketEvent[] = [
    { headline: 'Reliance Industries secures a major government contract, shares surge!', targetType: 'stock', targetId: 'RELIANCE', effect: 1.07, type: 'positive' },
    { headline: 'A new bug in a popular TCS product causes client concerns.', targetType: 'stock', targetId: 'TCS', effect: 0.95, type: 'negative' },
    { headline: 'Auto industry reports record sales; Tata Motors leads the rally.', targetType: 'stock', targetId: 'TATAMOTORS', effect: 1.08, type: 'positive' },
    { headline: 'SEBI introduces stricter regulations for Mutual Funds, causing short-term uncertainty.', targetType: 'sector', targetId: 'Mutual Fund', effect: 0.98, type: 'negative' },
    { headline: 'Positive global cues lead to a bull run in the Indian IT sector.', targetType: 'sector', targetId: 'Stock', effect: 1.04, type: 'positive', condition: (stock: Stock) => ['TCS', 'INFY'].includes(stock.id) },
    { headline: 'RBI announces surprise interest rate cut, boosting the entire market!', targetType: 'market', effect: 1.03, type: 'positive' },
    { headline: 'Inflation fears grip the market, leading to a widespread sell-off.', targetType: 'market', effect: 0.96, type: 'negative' },
];

const INITIAL_CASH = 100000;

// --- HELPER FUNCTIONS ---
const formatCurrency = (value: number) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
}).format(value);

// --- MAIN GAME PAGE COMPONENT ---
const GamePage: React.FC = () => {
    const [day, setDay] = useState<number>(1);
    const [cash, setCash] = useState<number>(INITIAL_CASH);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [marketData, setMarketData] = useState<Stock[]>(initialMarketData);
    const [modal, setModal] = useState<{ isOpen: boolean; type: 'Buy' | 'Sell' | 'Chart'; stock: Stock | null }>({ isOpen: false, type: 'Buy', stock: null });
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [marketNews, setMarketNews] = useState<{ headline: string; effect: 'positive' | 'negative' } | null>(null);

    // --- DERIVED STATE ---
    const portfolioValue = useMemo(() => {
        return holdings.reduce((total, holding) => {
            const stock = marketData.find(s => s.id === holding.stockId);
            return total + (stock ? stock.price * holding.quantity : 0);
        }, 0);
    }, [holdings, marketData]);

    const totalAssets = cash + portfolioValue;
    const totalPnl = totalAssets - INITIAL_CASH;
    const pnlPercent = (totalPnl / INITIAL_CASH) * 100;

    // --- GAME LOGIC ---
    const handleNextDay = useCallback(() => {
        let activeEvent: MarketEvent | null = null;
        if (Math.random() < 0.35) { // 35% chance of an event
            activeEvent = marketEvents[Math.floor(Math.random() * marketEvents.length)];
            setMarketNews({ headline: activeEvent.headline, effect: activeEvent.type });
        } else {
            setMarketNews(null);
        }

        setMarketData(prevData =>
            prevData.map(stock => {
                const baseChange = (Math.random() - 0.48) * stock.volatility * 2;
                let eventImpact = 0;

                if (activeEvent) {
                    const { targetType, targetId, effect, condition } = activeEvent;
                    let eventApplies = false;

                    if (targetType === 'market') eventApplies = true;
                    else if (targetType === 'stock' && stock.id === targetId) eventApplies = true;
                    else if (targetType === 'sector' && (condition ? condition(stock) : stock.type === targetId)) eventApplies = true;
                    
                    if (eventApplies) {
                        eventImpact = (effect - 1) * 3; // Make event impact significant
                    }
                }

                const totalChangePercent = baseChange + eventImpact;
                const newPrice = Math.max(stock.price * (1 + totalChangePercent), 1);
                
                return {
                    ...stock,
                    price: newPrice,
                    history: [...stock.history, newPrice].slice(-30), // Keep last 30 days
                };
            })
        );
        setDay(prevDay => prevDay + 1);
    }, []);
    
    // --- TRANSACTION LOGIC ---
    const handleTransaction = useCallback((stockId: string, quantity: number, type: 'Buy' | 'Sell') => {
        const stock = marketData.find(s => s.id === stockId);
        if (!stock) return;

        if (type === 'Buy') {
            const cost = stock.price * quantity;
            if (cash < cost) {
                showNotification(`Not enough cash to buy ${quantity} units of ${stock.name}.`, 'error');
                return;
            }
            setCash(prevCash => prevCash - cost);
            setHoldings(prevHoldings => {
                const existing = prevHoldings.find(h => h.stockId === stockId);
                if (existing) {
                    const totalQty = existing.quantity + quantity;
                    const totalCost = (existing.avgBuyPrice * existing.quantity) + cost;
                    return prevHoldings.map(h => h.stockId === stockId ? { ...h, quantity: totalQty, avgBuyPrice: totalCost / totalQty } : h);
                }
                return [...prevHoldings, { stockId, quantity, avgBuyPrice: stock.price }];
            });
            showNotification(`Successfully bought ${quantity} units of ${stock.name}.`, 'success');
        } else { // Sell
            const existing = holdings.find(h => h.stockId === stockId);
            if (!existing || existing.quantity < quantity) {
                showNotification(`You don't have ${quantity} units of ${stock.name} to sell.`, 'error');
                return;
            }
            setCash(prevCash => prevCash + (stock.price * quantity));
            setHoldings(prevHoldings => {
                if (existing.quantity === quantity) return prevHoldings.filter(h => h.stockId !== stockId);
                return prevHoldings.map(h => h.stockId === stockId ? { ...h, quantity: h.quantity - quantity } : h);
            });
            showNotification(`Successfully sold ${quantity} units of ${stock.name}.`, 'success');
        }
        closeModal();
    }, [cash, holdings, marketData]);

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const openModal = (type: 'Buy' | 'Sell', stock: Stock) => setModal({ isOpen: true, type, stock });
    const openChartModal = (stock: Stock) => setModal({ isOpen: true, type: 'Chart', stock });
    const closeModal = () => setModal({ isOpen: false, type: 'Buy', stock: null });

    // --- RENDER FUNCTIONS & SUB-COMPONENTS ---

    const GameModal: React.FC = () => {
        const [quantity, setQuantity] = useState(1);
        useEffect(() => { setQuantity(1); }, [modal.isOpen]);

        if (!modal.isOpen || !modal.stock) return null;

        const renderChart = () => {
            const chartData = modal.stock!.history.map((price, index) => ({
                day: Math.max(1, day - modal.stock!.history.length + index + 1),
                price: price,
            }));
            return (
                <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-800">{modal.stock!.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">30-Day Price History</p>
                    <div className="h-64 w-full">
                         <ResponsiveContainer>
                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" tickFormatter={d => `D${d}`}/>
                                <YAxis domain={['dataMin - 5', 'dataMax + 5']} tickFormatter={val => formatCurrency(val).replace('₹', '')}/>
                                <Tooltip formatter={(value: number) => [formatCurrency(value), 'Price']} />
                                <Legend />
                                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            );
        };

        const renderTransactionForm = () => {
            const maxQuantity = modal.type === 'Sell'
                ? holdings.find(h => h.stockId === modal.stock!.id)?.quantity || 0
                : Math.floor(cash / modal.stock!.price);
            const totalValue = modal.stock!.price * quantity;

            return (
                <form onSubmit={e => { e.preventDefault(); handleTransaction(modal.stock!.id, quantity, modal.type as 'Buy'|'Sell'); }} className="p-4 space-y-4">
                    <div>
                        <label htmlFor="quantity" className="text-sm font-medium text-slate-700">Quantity</label>
                        <input type="number" id="quantity" value={quantity}
                            onChange={e => setQuantity(Math.max(1, Math.min(maxQuantity, Number(e.target.value))))}
                            min="1" max={maxQuantity} className="w-full mt-1 p-2 border border-slate-300 rounded-lg" autoFocus/>
                        <p className="text-xs text-slate-500 mt-1">Max: {maxQuantity}</p>
                    </div>
                    <div className="text-center font-semibold text-slate-800">Total: {formatCurrency(totalValue)}</div>
                    <div className="flex gap-2">
                        <button type="button" onClick={closeModal} className="w-full py-2 px-4 bg-slate-200 text-slate-800 rounded-lg">Cancel</button>
                        <button type="submit" className={`w-full py-2 px-4 text-white rounded-lg ${modal.type === 'Buy' ? 'bg-green-500' : 'bg-red-500'}`}>Confirm</button>
                    </div>
                </form>
            );
        };
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center p-4 animate-fade-in" onClick={closeModal}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-pop-in" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between p-4 border-b">
                         <h3 className="text-lg font-bold text-slate-800">
                             {modal.type === 'Chart' ? 'Price Chart' : `${modal.type} ${modal.stock.name}`}
                         </h3>
                         <button onClick={closeModal}><XMarkIcon className="h-6 w-6 text-slate-500"/></button>
                    </div>
                    {modal.type === 'Chart' ? renderChart() : renderTransactionForm()}
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto max-w-7xl">
            <GameModal />
            {notification && (
                <div className={`fixed top-24 right-4 z-40 p-3 rounded-lg text-white animate-slide-in-up ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {notification.message}
                </div>
            )}
            <div className="text-center animate-slide-in-up mb-8">
                <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Stock Market Challenge</h1>
                <p className="text-lg text-slate-600 mt-3 max-w-3xl mx-auto">
                    Learn to invest with virtual money. Buy and sell in a simulated market and grow your portfolio!
                </p>
            </div>

            {marketNews && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in ${marketNews.effect === 'positive' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
                    <NewspaperIcon className={`h-8 w-8 flex-shrink-0 ${marketNews.effect === 'positive' ? 'text-green-600' : 'text-red-600'}`} />
                    <div>
                        <p className="font-bold text-sm text-slate-800">Market News</p>
                        <p className="text-sm text-slate-700">{marketNews.headline}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold text-slate-800">Market (Day {day})</h2>
                    <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs text-slate-600 uppercase">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-right">Change</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {marketData.map((stock, index) => {
                                    const change = stock.history.length > 1 ? stock.price - stock.history[stock.history.length - 2] : 0;
                                    const changePercent = stock.history.length > 1 ? (change / stock.history[stock.history.length - 2]) * 100 : 0;
                                    const isUp = change >= 0;
                                    return (
                                        <tr key={stock.id} onClick={() => openChartModal(stock)} className={`border-b hover:bg-slate-100 cursor-pointer ${index % 2 === 0 ? '' : 'bg-slate-50/50'}`}>
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                {stock.name}
                                                <span className="block text-xs text-slate-500 font-normal">{stock.type}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold">{formatCurrency(stock.price)}</td>
                                            <td className={`px-4 py-3 text-right font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
                                                {isUp ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={e => { e.stopPropagation(); openModal('Buy', stock); }} className="bg-green-500 text-white px-3 py-1 rounded-md text-xs font-bold">BUY</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">My Portfolio</h2>
                            <button onClick={handleNextDay} className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
                                <ClockIcon className="h-5 w-5" /> Next Day
                            </button>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-sm text-slate-500">Total Assets</p>
                                <p className="text-xl font-bold text-slate-800">{formatCurrency(totalAssets)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Profit / Loss</p>
                                <p className={`text-xl font-bold ${totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(totalPnl)} ({pnlPercent.toFixed(2)}%)
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-lg">
                        <h3 className="font-bold text-slate-800 mb-2">Holdings ({holdings.length})</h3>
                        <div className="text-sm flex justify-between font-semibold border-b pb-2 mb-2">
                           <p>Cash</p> 
                           <p>{formatCurrency(cash)}</p>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {holdings.length === 0 ? (
                                <p className="text-center text-sm text-slate-500 py-4">Your portfolio is empty.</p>
                            ) : holdings.map(holding => {
                                const stock = marketData.find(s => s.id === holding.stockId)!;
                                const currentValue = stock.price * holding.quantity;
                                const pnl = currentValue - (holding.avgBuyPrice * holding.quantity);
                                return (
                                    <div key={holding.stockId} className="text-xs p-3 bg-slate-50 rounded-lg">
                                        <div className="flex justify-between items-center font-bold">
                                            <p className="text-slate-800">{stock.name}</p>
                                            <p>{holding.quantity} units</p>
                                        </div>
                                        <div className="flex justify-between items-center mt-2 text-slate-600">
                                            <div>
                                                <p>Avg. Price: {formatCurrency(holding.avgBuyPrice)}</p>
                                                <p>Value: <span className="font-semibold">{formatCurrency(currentValue)}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p>P/L</p>
                                                <p className={`font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(pnl)}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => openModal('Sell', stock)} className="mt-2 w-full bg-red-500 text-white text-center py-1 rounded font-bold">SELL</button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GamePage;