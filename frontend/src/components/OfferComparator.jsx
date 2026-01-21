import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Scale, Plus, Trash2, TrendingUp } from 'lucide-react';
import { BRAND } from '../config/branding';
import SideMenu from './SideMenu';
import Header from './Header';

const OfferComparator = () => {
    const navigate = useNavigate();
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [offers, setOffers] = useState([
        { id: 1, company: '', salary: '', bonus: '', equity: '', benefits: '', location: '', remote: 'no' },
        { id: 2, company: '', salary: '', bonus: '', equity: '', benefits: '', location: '', remote: 'no' }
    ]);
    const [comparison, setComparison] = useState(null);

    const addOffer = () => {
        setOffers([...offers, {
            id: offers.length + 1,
            company: '',
            salary: '',
            bonus: '',
            equity: '',
            benefits: '',
            location: '',
            remote: 'no'
        }]);
    };

    const removeOffer = (id) => {
        if (offers.length > 2) {
            setOffers(offers.filter(offer => offer.id !== id));
        }
    };

    const updateOffer = (id, field, value) => {
        setOffers(offers.map(offer =>
            offer.id === id ? { ...offer, [field]: value } : offer
        ));
    };

    const compareOffers = () => {
        const validOffers = offers.filter(o => o.company && o.salary);
        if (validOffers.length < 2) {
            alert('Please fill in at least 2 offers with company name and salary');
            return;
        }

        const results = validOffers.map(offer => {
            const salary = parseFloat(offer.salary) || 0;
            const bonus = parseFloat(offer.bonus) || 0;
            const equity = parseFloat(offer.equity) || 0;
            const benefits = parseFloat(offer.benefits) || 0;
            const total = salary + bonus + equity + benefits;

            return {
                ...offer,
                totalComp: total,
                breakdown: { salary, bonus, equity, benefits }
            };
        });

        results.sort((a, b) => b.totalComp - a.totalComp);
        setComparison(results);
    };

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", background: '#f8fafc', minHeight: '100vh' }}>
            <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} />
            <Header onMenuClick={() => setSideMenuOpen(true)} />

            <section style={{
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                padding: '4rem 2rem',
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Scale style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                        Offer Comparison Calculator
                    </h1>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                        Compare multiple job offers side-by-side with total compensation analysis
                    </p>
                </div>
            </section>

            <section style={{ padding: '4rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {!comparison ? (
                        <>
                            <div style={{ display: 'grid', gap: '2rem', marginBottom: '2rem' }}>
                                {offers.map((offer, index) => (
                                    <Card key={offer.id} style={{ border: '1px solid #e2e8f0' }}>
                                        <CardHeader>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <CardTitle>Offer #{index + 1}</CardTitle>
                                                {offers.length > 2 && (
                                                    <Button
                                                        onClick={() => removeOffer(offer.id)}
                                                        style={{
                                                            background: '#fee2e2',
                                                            color: '#991b1b',
                                                            padding: '0.5rem',
                                                            border: 'none'
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b', fontSize: '0.875rem' }}>
                                                        Company Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g., Google"
                                                        value={offer.company}
                                                        onChange={(e) => updateOffer(offer.id, 'company', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9375rem'
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b', fontSize: '0.875rem' }}>
                                                        Base Salary * ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="120000"
                                                        value={offer.salary}
                                                        onChange={(e) => updateOffer(offer.id, 'salary', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9375rem'
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b', fontSize: '0.875rem' }}>
                                                        Annual Bonus ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="15000"
                                                        value={offer.bonus}
                                                        onChange={(e) => updateOffer(offer.id, 'bonus', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9375rem'
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b', fontSize: '0.875rem' }}>
                                                        Equity Value ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="50000"
                                                        value={offer.equity}
                                                        onChange={(e) => updateOffer(offer.id, 'equity', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9375rem'
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b', fontSize: '0.875rem' }}>
                                                        Benefits Value ($)
                                                    </label>
                                                    <input
                                                        type="number"
                                                        placeholder="10000"
                                                        value={offer.benefits}
                                                        onChange={(e) => updateOffer(offer.id, 'benefits', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9375rem'
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b', fontSize: '0.875rem' }}>
                                                        Location
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder="San Francisco, CA"
                                                        value={offer.location}
                                                        onChange={(e) => updateOffer(offer.id, 'location', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9375rem'
                                                        }}
                                                    />
                                                </div>

                                                <div>
                                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#1e293b', fontSize: '0.875rem' }}>
                                                        Remote Work
                                                    </label>
                                                    <select
                                                        value={offer.remote}
                                                        onChange={(e) => updateOffer(offer.id, 'remote', e.target.value)}
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.75rem',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            fontSize: '0.9375rem'
                                                        }}
                                                    >
                                                        <option value="no">No</option>
                                                        <option value="hybrid">Hybrid</option>
                                                        <option value="full">Full Remote</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button
                                    onClick={addOffer}
                                    style={{
                                        background: 'white',
                                        color: '#14b8a6',
                                        border: '1px solid #14b8a6',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Another Offer
                                </Button>

                                <Button
                                    onClick={compareOffers}
                                    style={{
                                        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                        color: 'white',
                                        padding: '0.75rem 2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <TrendingUp className="w-5 h-5" />
                                    Compare Offers
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div style={{ marginBottom: '2rem' }}>
                                <Button
                                    onClick={() => setComparison(null)}
                                    style={{
                                        background: 'white',
                                        color: '#64748b',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    ← Edit Offers
                                </Button>
                            </div>

                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {comparison.map((offer, index) => (
                                    <Card key={offer.id} style={{
                                        border: index === 0 ? '3px solid #14b8a6' : '1px solid #e2e8f0',
                                        position: 'relative'
                                    }}>
                                        {index === 0 && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '-12px',
                                                left: '50%',
                                                transform: 'translateX(-50%)',
                                                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                                                color: 'white',
                                                padding: '0.5rem 1.5rem',
                                                borderRadius: '20px',
                                                fontSize: '0.875rem',
                                                fontWeight: 700
                                            }}>
                                                🏆 Best Offer
                                            </div>
                                        )}

                                        <CardHeader>
                                            <CardTitle style={{ fontSize: '1.5rem' }}>{offer.company}</CardTitle>
                                            {offer.location && (
                                                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                                                    {offer.location} • {offer.remote === 'full' ? 'Full Remote' : offer.remote === 'hybrid' ? 'Hybrid' : 'On-site'}
                                                </p>
                                            )}
                                        </CardHeader>

                                        <CardContent>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#14b8a6', marginBottom: '0.25rem' }}>
                                                    ${offer.totalComp.toLocaleString()}
                                                </div>
                                                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                                    Total Annual Compensation
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                                                {offer.breakdown.salary > 0 && (
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Base Salary</div>
                                                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                                                            ${offer.breakdown.salary.toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}
                                                {offer.breakdown.bonus > 0 && (
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Bonus</div>
                                                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                                                            ${offer.breakdown.bonus.toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}
                                                {offer.breakdown.equity > 0 && (
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Equity</div>
                                                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                                                            ${offer.breakdown.equity.toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}
                                                {offer.breakdown.benefits > 0 && (
                                                    <div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Benefits</div>
                                                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>
                                                            ${offer.breakdown.benefits.toLocaleString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <Card style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: 'none' }}>
                                <CardContent style={{ padding: '2rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1e3a8a' }}>
                                        💡 Things to Consider Beyond Compensation
                                    </h3>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: 1.8 }}>
                                        <li>Company culture and work-life balance</li>
                                        <li>Growth opportunities and career development</li>
                                        <li>Team quality and manager reputation</li>
                                        <li>Company stability and future prospects</li>
                                        <li>Commute time and flexibility</li>
                                        <li>Health insurance quality and coverage</li>
                                        <li>401k matching and other retirement benefits</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </section>

            <footer style={{ background: '#0f172a', padding: '2rem', color: '#94a3b8', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.875rem' }}>{BRAND.copyright}</p>
            </footer>
        </div>
    );
};

export default OfferComparator;
