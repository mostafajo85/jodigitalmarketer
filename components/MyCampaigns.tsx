import React, { useState, useEffect } from 'react';
import { Language, CampaignInputs, GeneratedAsset } from '../types';
import { getCampaigns, getCampaign, deleteCampaign, SavedCampaign } from '../services/databaseService';
import { Folder, Trash2, Eye, Loader, Calendar, Globe2 } from 'lucide-react';

interface Props {
    lang: Language;
    onLoadCampaign: (data: { inputs: CampaignInputs; assets: GeneratedAsset[]; consistencyGuide: string }) => void;
}

const MyCampaigns: React.FC<Props> = ({ lang, onLoadCampaign }) => {
    const [campaigns, setCampaigns] = useState<SavedCampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        try {
            setIsLoading(true);
            setError('');
            const data = await getCampaigns();
            setCampaigns(data);
        } catch (err) {
            console.error('Error loading campaigns:', err);
            setError(lang === 'ar' ? 'فشل تحميل الحملات' : 'Failed to load campaigns');
        } finally {
            setIsLoading(false);
        }
    };

    const handleView = async (id: number) => {
        try {
            const { campaign, assets } = await getCampaign(id);
            onLoadCampaign({
                inputs: {
                    productName: campaign.productName,
                    description: campaign.description,
                    language: campaign.language as 'Arabic' | 'English',
                    brandVibe: campaign.brandVibe
                },
                assets,
                consistencyGuide: campaign.consistencyGuide || ''
            });
        } catch (err) {
            console.error('Error loading campaign:', err);
            alert(lang === 'ar' ? 'فشل تحميل الحملة' : 'Failed to load campaign');
        }
    };

    const handleDelete = async (id: number) => {
        const confirmMsg = lang === 'ar'
            ? 'هل أنت متأكد من حذف هذه الحملة؟'
            : 'Are you sure you want to delete this campaign?';

        if (!confirm(confirmMsg)) return;

        try {
            setDeletingId(id);
            await deleteCampaign(id);
            setCampaigns(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Error deleting campaign:', err);
            alert(lang === 'ar' ? 'فشل حذف الحملة' : 'Failed to delete campaign');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const t = {
        ar: {
            title: 'حملاتي السابقة',
            empty: 'لا توجد حملات محفوظة',
            emptyDesc: 'ابدأ بإنشاء حملتك الأولى!',
            view: 'عرض',
            delete: 'حذف',
            loading: 'جاري التحميل...',
            campaigns: 'حملة',
        },
        en: {
            title: 'My Campaigns',
            empty: 'No saved campaigns',
            emptyDesc: 'Start by creating your first campaign!',
            view: 'View',
            delete: 'Delete',
            loading: 'Loading...',
            campaigns: 'campaigns',
        }
    };

    const txt = t[lang];

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader className="animate-spin mx-auto mb-4 text-banana-400" size={48} />
                    <p className="text-gray-400">{txt.loading}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-6 text-center">
                    <p className="text-red-400">{error}</p>
                </div>
            </div>
        );
    }

    if (campaigns.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Folder className="mx-auto mb-4 text-gray-600" size={64} />
                    <h2 className="text-2xl font-bold text-white mb-2">{txt.empty}</h2>
                    <p className="text-gray-400">{txt.emptyDesc}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 pb-20">
            <div className={`mb-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                <h1 className="text-3xl font-bold text-white mb-2">{txt.title}</h1>
                <p className="text-gray-400">{campaigns.length} {txt.campaigns}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                    <div
                        key={campaign.id}
                        className="bg-nano-900 border border-nano-800 rounded-xl overflow-hidden hover:border-banana-400/40 transition-all duration-300 group"
                    >
                        <div className="p-6">
                            <div className={`mb-4 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                                <h3 className="text-lg font-bold text-white mb-2 truncate">
                                    {campaign.productName}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-2 min-h-[40px]">
                                    {campaign.description}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 flex-wrap">
                                <div className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {formatDate(campaign.createdAt)}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Globe2 size={12} />
                                    {campaign.language}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleView(campaign.id)}
                                    className="flex-1 px-4 py-2 bg-banana-400 hover:bg-banana-300 text-nano-950 rounded-lg flex items-center justify-center gap-2 transition-all font-bold text-sm"
                                >
                                    <Eye size={14} />
                                    {txt.view}
                                </button>
                                <button
                                    onClick={() => handleDelete(campaign.id)}
                                    disabled={deletingId === campaign.id}
                                    className="px-4 py-2 bg-nano-800 hover:bg-red-900/50 text-red-400 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
                                >
                                    {deletingId === campaign.id ? (
                                        <Loader className="animate-spin" size={14} />
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCampaigns;
