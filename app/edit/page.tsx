'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  Upload, 
  X, 
  Sliders, 
  PhoneCall, 
  Compass, 
  FileText, 
  Check, 
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '@/components/AppContext';
import { Room, HomeSlide } from '@/types/content';
import Image from 'next/image';
import PagePreview from '@/components/PagePreview';
import { EditPreviewProvider } from '@/components/EditPreviewProvider';
import {
  buildEditPreviewDraft,
  resolvePreviewPageFromEditContext,
  type PreviewPageId,
} from '@/lib/editPreview';
import EditSidebar, { ActiveTab } from '@/components/EditSidebar';
import MenuSettingsHeader, {
  type MenuSelection,
  normalizeMenuSelection,
  parseStyleMenuId,
} from '@/components/edit/MenuSettingsHeader';
import GeneralSettingsHeader, { type GeneralSelection } from '@/components/edit/GeneralSettingsHeader';
import {
  appendEditActivity,
  formatActivityTime,
  loadEditActivityLog,
  type EditActivityEntry,
} from '@/lib/editActivityLog';
import CardFormModal from '@/components/CardFormModal';
import ImageUploadCrop from '@/components/ImageUploadCrop';
import SaveNoticeModal, { type SaveNoticeStatus } from '@/components/SaveNoticeModal';
import EditAnalyticsPanel from '@/components/EditAnalyticsPanel';
import { isProductMode } from '@/lib/config/appMode';
import { Field, SectionCard, inputClass, textareaClass } from '@/components/edit/editFormFields';
import { MAX_FEATURED_PER_PAGE, isValidFeaturedRank } from '@/lib/featuredRooms';
import { aspectRatioClass, formatImageSizeGuide, SLIDE_DEFAULT_ASPECT_RATIO } from '@/lib/imageCrop';
import { shouldBypassImageOptimizer } from '@/lib/imageDisplay';
import { roomCoverAspectRatio } from '@/lib/roomImages';

function PreviewPageButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-xs border transition-colors ${
        active ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300 hover:border-black'
      }`}
    >
      {label}
    </button>
  );
}

export default function EditPage() {
  const {
    branding,
    stylePages,
    rooms,
    homeSlides,
    contactChannels,
    contactLabel,
    updateBranding,
    updateHomeSlides,
    addStylePage,
    updateStylePage,
    deleteStylePage,
    addRoom,
    editRoom,
    deleteRoom,
    keywords,
    addKeyword,
    updateKeyword,
    deleteKeyword,
    updateContactSettings,
    teamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    syncNow,
    t,
  } = useApp();

  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [activeTab, setActiveTab] = useState<ActiveTab>('menus');
  const [menuSelection, setMenuSelection] = useState<MenuSelection>('home');
  const [generalSelection, setGeneralSelection] = useState<GeneralSelection>('brand');
  const [activityLog, setActivityLog] = useState<EditActivityEntry[]>([]);
  const activeStyleMenuId = activeTab === 'menus' ? parseStyleMenuId(menuSelection) : null;

  const menuOptions = useMemo(() => {
    const opts: { value: MenuSelection; label: string }[] = [
      { value: 'home', label: t('edit.menu.targetHome') },
      { value: 'contact', label: t('edit.menu.targetContact') },
      { value: 'team', label: t('edit.menu.targetTeam') },
    ];
    for (const page of stylePages) {
      opts.push({
        value: `style-${page.id}`,
        label: t('edit.menu.targetStyle').replace('{name}', page.name),
      });
    }
    opts.push({ value: 'add-page', label: t('edit.tab.addPage') });
    return opts;
  }, [stylePages, t]);

  const generalOptions = useMemo(
    () => [
      { value: 'brand' as const, label: t('edit.general.brand') },
      { value: 'footer' as const, label: t('edit.general.footer') },
      { value: 'address' as const, label: t('edit.general.address') },
      { value: 'intro' as const, label: t('edit.general.intro') },
      { value: 'channels' as const, label: t('edit.general.channels') },
      { value: 'audit' as const, label: t('edit.general.audit') },
    ],
    [t],
  );

  const filteredRooms = activeStyleMenuId
    ? rooms.filter((r) => r.pageId === activeStyleMenuId)
    : rooms;

  const [previewPage, setPreviewPage] = useState<PreviewPageId>('home');

  // Form states
  const [brandForm, setBrandForm] = useState(branding);
  const [contactForm, setContactForm] = useState({
    label: contactLabel,
    line: contactChannels.line ?? '',
    phone: contactChannels.phone ?? '',
    email: contactChannels.email ?? '',
  });

  const [newPageName, setNewPageName] = useState('');
  const [newPageDesc, setNewPageDesc] = useState('');
  const [newKeywordName, setNewKeywordName] = useState('');
  const [pageSettingsForm, setPageSettingsForm] = useState({ name: '', description: '' });

  // Card modal states
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Room | null>(null);
  const [cardModalPageId, setCardModalPageId] = useState(stylePages[0]?.id || 'moderne');

  // Home slides form
  const [slidesForm, setSlidesForm] = useState<HomeSlide[]>(homeSlides);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlidePageId, setNewSlidePageId] = useState(stylePages[0]?.id || 'moderne');
  const [slideCropOpen, setSlideCropOpen] = useState(false);

  const [teamCropOpen, setTeamCropOpen] = useState(false);
  const [teamCropTargetId, setTeamCropTargetId] = useState<string | null>(null);
  const [newTeamForm, setNewTeamForm] = useState({ name: '', role: '', imageUrl: '' });

  React.useEffect(() => {
    setBrandForm(branding);
  }, [branding]);

  React.useEffect(() => {
    setSlidesForm(homeSlides);
  }, [homeSlides]);

  React.useEffect(() => {
    setContactForm({
      label: contactLabel,
      line: contactChannels.line ?? '',
      phone: contactChannels.phone ?? '',
      email: contactChannels.email ?? '',
    });
  }, [contactLabel, contactChannels]);

  React.useEffect(() => {
    if (activeStyleMenuId) {
      const page = stylePages.find((p) => p.id === activeStyleMenuId);
      if (page) setPageSettingsForm({ name: page.name, description: page.description });
    }
  }, [activeStyleMenuId, stylePages]);

  React.useEffect(() => {
    if (activeTab === 'general' && generalSelection === 'audit') {
      setActivityLog(loadEditActivityLog());
    }
  }, [activeTab, generalSelection]);

  const logEdit = useCallback((action: string, detail?: string) => {
    appendEditActivity(action, detail);
    setActivityLog(loadEditActivityLog());
  }, []);

  const [saveNoticeOpen, setSaveNoticeOpen] = useState(false);
  const [saveNoticeStatus, setSaveNoticeStatus] = useState<SaveNoticeStatus>('success');
  const [saveNoticeMessage, setSaveNoticeMessage] = useState('');
  const [saveNoticeDetail, setSaveNoticeDetail] = useState<string | undefined>();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showSaveWithSync = useCallback(async () => {
    setSaveNoticeStatus('syncing');
    setSaveNoticeMessage(t('edit.saveNotice.syncing'));
    setSaveNoticeDetail(undefined);
    setSaveNoticeOpen(true);

    const product = isProductMode();
    const ok = product ? await syncNow() : true;

    if (ok) {
      setSaveNoticeStatus('success');
      setSaveNoticeMessage(product ? t('edit.saveNotice.serverOk') : t('edit.saveNotice.localOk'));
      setSaveNoticeDetail(product ? undefined : t('edit.saveNotice.localDetail'));
    } else {
      setSaveNoticeStatus('error');
      setSaveNoticeMessage(t('edit.saveNotice.serverError'));
      setSaveNoticeDetail(t('edit.saveNotice.serverErrorDetail'));
    }
  }, [syncNow, t]);

  const closeSaveNotice = useCallback(() => {
    setSaveNoticeOpen(false);
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamForm.name.trim() || !newTeamForm.imageUrl) {
      alert(t('edit.team.validation'));
      return;
    }
    const name = newTeamForm.name.trim();
    const created = addTeamMember(newTeamForm);
    if (created) {
      logEdit('เพิ่มสมาชิกทีม', name);
      setNewTeamForm({ name: '', role: '', imageUrl: '' });
      void showSaveWithSync();
    }
  };

  const openTeamCrop = (memberId: string | null) => {
    setTeamCropTargetId(memberId);
    setTeamCropOpen(true);
  };

  const handleTeamCropComplete = (result: { url: string }) => {
    if (teamCropTargetId) {
      updateTeamMember(teamCropTargetId, { imageUrl: result.url });
      void showSaveWithSync();
    } else {
      setNewTeamForm((prev) => ({ ...prev, imageUrl: result.url }));
    }
    setTeamCropOpen(false);
    setTeamCropTargetId(null);
  };

  const saveBrandForm = (logAction: string, logDetail?: string) => {
    updateBranding({ ...brandForm, introTitle: brandForm.name });
    logEdit(logAction, logDetail);
    void showSaveWithSync();
  };

  const handleSaveHomePage = (e: React.FormEvent) => {
    e.preventDefault();
    saveBrandForm('บันทึกหน้าแรก', brandForm.homeLabel);
  };

  const handleSaveGeneralBrand = (e: React.FormEvent) => {
    e.preventDefault();
    saveBrandForm('บันทึกแบรนด์', brandForm.name);
  };

  const handleSaveGeneralFooter = (e: React.FormEvent) => {
    e.preventDefault();
    saveBrandForm('บันทึก Footer');
  };

  const handleSaveGeneralAddress = (e: React.FormEvent) => {
    e.preventDefault();
    saveBrandForm('บันทึกที่อยู่');
  };

  const handleSaveMenuContact = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactSettings(contactChannels, contactForm.label);
    updateBranding({
      contactHeroTitle: brandForm.contactHeroTitle,
      contactHeroDesc: brandForm.contactHeroDesc,
      contactChannelsTitle: brandForm.contactChannelsTitle,
      contactChannelsDesc: brandForm.contactChannelsDesc,
    });
    logEdit('บันทึกเมนู & ข้อความหน้าติดต่อ');
    void showSaveWithSync();
  };

  const handleSaveIntro = (e: React.FormEvent) => {
    e.preventDefault();
    updateBranding({ ...brandForm, introTitle: brandForm.name });
    logEdit('บันทึกอินโทรเปิดเว็บ');
    void showSaveWithSync();
  };

  const handleSaveContactChannels = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactSettings(
      {
        line: contactForm.line,
        phone: contactForm.phone,
        email: contactForm.email,
      },
      contactForm.label,
    );
    logEdit('บันทึกช่องทางติดต่อ', contactForm.label);
    void showSaveWithSync();
  };

  const handleAddPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageName.trim()) return;
    const page = addStylePage(newPageName.trim(), newPageDesc.trim());
    if (page) {
      setActiveTab('menus');
      setMenuSelection(`style-${page.id}`);
      setNewPageName('');
      setNewPageDesc('');
      void showSaveWithSync();
    }
  };

  const handleSavePageSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStyleMenuId) return;
    updateStylePage(activeStyleMenuId, pageSettingsForm);
    logEdit('บันทึกเมนูสไตล์', pageSettingsForm.name);
    void showSaveWithSync();
  };

  const handleDeletePageSettings = () => {
    if (!activeStyleMenuId) return;
    if (stylePages.length <= 1) {
      alert('ต้องมีอย่างน้อย 1 หน้า');
      return;
    }
    const pageName = stylePages.find((p) => p.id === activeStyleMenuId)?.name || activeStyleMenuId;
    if (!confirm(`ยืนยันลบหน้า "${pageName}" และการ์ดทั้งหมดในหน้านี้?`)) return;
    deleteStylePage(activeStyleMenuId);
    setActiveTab('menus');
    setMenuSelection('home');
    showToast('ลบหน้าแล้ว');
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeywordName.trim()) return;
    const created = addKeyword(newKeywordName.trim());
    if (created) {
      setNewKeywordName('');
      void showSaveWithSync();
    }
  };

  const openCreateCardModal = (pageId: string) => {
    setEditingCard(null);
    setCardModalPageId(pageId);
    setIsCardModalOpen(true);
  };

  const openEditCardModal = (room: Room) => {
    setEditingCard(room);
    setCardModalPageId(room.pageId);
    setIsCardModalOpen(true);
  };

  const handleCardSave = (data: Omit<Room, 'id'> & { id?: string }) => {
    const featuredCountOnPage = rooms.filter(
      (room) =>
        room.pageId === data.pageId &&
        room.id !== data.id &&
        isValidFeaturedRank(room.featuredRank),
    ).length;
    if (isValidFeaturedRank(data.featuredRank) && featuredCountOnPage >= MAX_FEATURED_PER_PAGE) {
      alert(`เมนูนี้ติดดาวครบ ${MAX_FEATURED_PER_PAGE} การ์ดแล้ว`);
      return;
    }
    const rankConflict = rooms.find(
      (room) =>
        room.pageId === data.pageId &&
        room.id !== data.id &&
        room.featuredRank === data.featuredRank &&
        isValidFeaturedRank(room.featuredRank),
    );
    if (isValidFeaturedRank(data.featuredRank) && rankConflict) {
      alert(`อันดับดาว ${data.featuredRank} ถูกใช้แล้วในเมนูนี้`);
      return;
    }
    if (data.id) {
      editRoom({ ...data, id: data.id });
      void showSaveWithSync();
    } else {
      addRoom(data);
      void showSaveWithSync();
    }
    setIsCardModalOpen(false);
  };

  const handleSaveHomeSlides = (e: React.FormEvent) => {
    e.preventDefault();
    updateHomeSlides(slidesForm);
    updateBranding({ ...brandForm, introTitle: brandForm.name });
    logEdit('บันทึกสไลด์ & หัวข้อฟีด');
    void showSaveWithSync();
  };

  const handleAddHomeSlide = (result: { url: string; aspectRatio: HomeSlide['aspectRatio'] }) => {
    const title =
      newSlideTitle.trim() ||
      `${t('edit.homeSlides.slideTitle')} ${slidesForm.length + 1}`;
    setSlidesForm((prev) => [
      ...prev,
      {
        id: `slide_${Date.now()}`,
        imageUrl: result.url,
        title,
        pageId: newSlidePageId,
        aspectRatio: SLIDE_DEFAULT_ASPECT_RATIO,
      },
    ]);
    setNewSlideTitle('');
    setSlideCropOpen(false);
    void showSaveWithSync();
  };

  const handleRemoveHomeSlide = (id: string) => {
    setSlidesForm((prev) => prev.filter((s) => s.id !== id));
  };

  const previewDraft = useMemo(
    () =>
      buildEditPreviewDraft({
        brandForm,
        slidesForm,
        contactForm,
        activeStyleMenuId,
        pageSettingsForm,
      }),
    [brandForm, slidesForm, contactForm, activeStyleMenuId, pageSettingsForm],
  );

  const contextPreviewPage = useMemo(
    () =>
      resolvePreviewPageFromEditContext({
        activeTab,
        menuSelection,
        generalSelection,
        activeStyleMenuId,
        stylePages,
      }),
    [activeTab, menuSelection, generalSelection, activeStyleMenuId, stylePages],
  );

  const openPreview = useCallback(() => {
    setPreviewPage(contextPreviewPage);
    setMode('preview');
  }, [contextPreviewPage]);

  return (
    <div className="flex flex-col bg-slate-50 min-h-screen w-full relative pb-20">
      <SaveNoticeModal
        open={saveNoticeOpen}
        status={saveNoticeStatus}
        message={saveNoticeMessage || t('edit.saveNotice.message')}
        detail={saveNoticeDetail}
        confirmLabel={t('edit.saveNotice.confirm')}
        onClose={closeSaveNotice}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-6 py-3 shadow-2xl flex items-center gap-2 border border-neutral-800 text-sm font-medium tracking-tight uppercase"
          >
            <Check size={16} className="text-green-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Header */}
      <section className="bg-black text-white px-6 py-12 md:py-16 md:px-12">
        <div className="flex items-center gap-2 mb-2 text-xs font-mono uppercase tracking-widest text-gray-400">
          <Sliders size={12} />
          {t('edit.controlCenter')}
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter leading-none">
          {t('edit.title')}
        </h1>
        <p className="text-gray-400 text-sm mt-2 max-w-lg leading-relaxed">
          {t('edit.subtitle')}
        </p>
      </section>

      {/* Mode Switch Button */}
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => (mode === 'edit' ? openPreview() : setMode('edit'))}
          className="px-4 py-2 text-xs bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
        >
          {mode === 'edit' ? t('edit.showPreview') : t('edit.backToEdit')}
        </button>
      </div>
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <EditSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hidden={mode === 'preview'}
        />

        {/* Right Side Editor panels */}
        <div className={`lg:col-span-9 bg-white border border-gray-200 p-6 md:p-10 shadow-sm rounded-none min-h-[calc(100vh-12rem)] ${mode === 'preview' ? 'hidden' : ''}`}>
          
          {/* GENERAL SETTINGS (bottom sidebar) */}
          {activeTab === 'general' && (
            <div className="space-y-8">
              <GeneralSettingsHeader
                selection={generalSelection}
                onSelectionChange={setGeneralSelection}
                options={generalOptions}
                title={t('edit.general.title')}
                description={t('edit.general.desc')}
              />

              {generalSelection === 'brand' && (
                <form onSubmit={handleSaveGeneralBrand} className="space-y-4 max-w-lg">
                  <SectionCard title="แบรนด์" description="ชื่อสตูดิโอและตัวย่อโลโก้ — ใช้ทั่วเว็บและอินโทร">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="ชื่อสตูดิโอ" hint="ซิงค์กับหัวข้ออินโทรอัตโนมัติ">
                        <input
                          type="text"
                          value={brandForm.name}
                          onChange={(e) => {
                            const name = e.target.value;
                            setBrandForm((prev) => ({ ...prev, name, introTitle: name }));
                          }}
                          className={inputClass}
                          required
                        />
                      </Field>
                      <Field label="ตัวย่อโลโก้" hint="สูงสุด 5 ตัวอักษร">
                        <input
                          type="text"
                          value={brandForm.shortName}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, shortName: e.target.value }))}
                          className={inputClass}
                          maxLength={5}
                          required
                        />
                      </Field>
                    </div>
                  </SectionCard>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {t('edit.general.saveBrand')}
                  </button>
                </form>
              )}

              {generalSelection === 'footer' && (
                <form onSubmit={handleSaveGeneralFooter} className="space-y-4 max-w-lg">
                  <SectionCard title="Footer" description="ท้ายทุกหน้าสาธารณะ">
                    <div className="space-y-4">
                      <Field label="หัวข้อ Footer" hint="ใช้ \\n ขึ้นบรรทัดใหม่">
                        <textarea
                          value={brandForm.footerTitle}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, footerTitle: e.target.value }))}
                          rows={3}
                          className={textareaClass}
                          required
                        />
                      </Field>
                      <Field label="คำอธิบาย Footer">
                        <textarea
                          value={brandForm.footerDescription}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, footerDescription: e.target.value }))}
                          rows={3}
                          className={textareaClass}
                          required
                        />
                      </Field>
                    </div>
                  </SectionCard>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {t('edit.general.saveFooter')}
                  </button>
                </form>
              )}

              {generalSelection === 'address' && (
                <form onSubmit={handleSaveGeneralAddress} className="space-y-4 max-w-lg">
                  <SectionCard title="ที่อยู่สตูดิโอ" description="แสดงบนหน้าติดต่อ">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="บรรทัดที่ 1">
                        <input
                          type="text"
                          value={brandForm.hqAddressLine1}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, hqAddressLine1: e.target.value }))}
                          className={inputClass}
                          required
                        />
                      </Field>
                      <Field label="บรรทัดที่ 2">
                        <input
                          type="text"
                          value={brandForm.hqAddressLine2}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, hqAddressLine2: e.target.value }))}
                          className={inputClass}
                          required
                        />
                      </Field>
                    </div>
                  </SectionCard>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {t('edit.general.saveAddress')}
                  </button>
                </form>
              )}

              {generalSelection === 'intro' && (
                <form
                  onSubmit={handleSaveIntro}
                  className="border border-gray-200 bg-gray-50/40 p-4 sm:p-5 space-y-4 max-w-lg"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                      {t('edit.general.introKicker')}
                    </label>
                    <p className="text-[10px] text-gray-400 min-h-[1.25rem] leading-snug">
                      แสดงครั้งเดียวต่อ session เมื่อเข้าเว็บครั้งแรก
                    </p>
                    <input
                      type="text"
                      value={brandForm.introKicker}
                      onChange={(e) => setBrandForm((prev) => ({ ...prev, introKicker: e.target.value }))}
                      className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 bg-white border border-gray-200 px-3 py-2">
                    {t('edit.general.introSynced')}:{' '}
                    <span className="font-semibold text-gray-800">{brandForm.name || '—'}</span>
                    <span className="text-gray-400"> (แก้ที่ตั้งค่าทั่วไป → แบรนด์)</span>
                  </p>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {t('edit.general.saveIntro')}
                  </button>
                </form>
              )}

              {generalSelection === 'channels' && (
                <form onSubmit={handleSaveContactChannels} className="space-y-6 max-w-lg">
                  <div className="border border-gray-200 bg-gray-50/40 p-4 sm:p-5 space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                        {t('edit.contactSettings.buttonLabel')}
                      </label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem] leading-snug">
                        ใช้กับปุ่มติดต่อใน Header / Footer / หน้าติดต่อ
                      </p>
                      <input
                        type="text"
                        value={contactForm.label}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, label: e.target.value }))}
                        className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                        {t('edit.contactSettings.lineLabel')}
                      </label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem] leading-snug">{t('edit.contactSettings.linePlaceholder')}</p>
                      <input
                        type="text"
                        value={contactForm.line}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, line: e.target.value }))}
                        className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                        {t('edit.contactSettings.phoneLabel')}
                      </label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem] leading-snug">{t('edit.contactSettings.phonePlaceholder')}</p>
                      <input
                        type="text"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, phone: e.target.value }))}
                        className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                        {t('edit.contactSettings.emailLabel')}
                      </label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem] leading-snug">{t('edit.contactSettings.emailPlaceholder')}</p>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm((prev) => ({ ...prev, email: e.target.value }))}
                        className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white shrink-0 text-xs font-bold">
                      i
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-black">{t('edit.contactSettings.previewTitle')}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{t('edit.contactSettings.previewHint')}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="bg-black text-white text-[10px] uppercase tracking-widest font-semibold px-3 py-1.5">
                          {contactForm.label || 'ติดต่อ'}
                        </span>
                        {[contactForm.line, contactForm.phone, contactForm.email].filter(Boolean).length === 0 && (
                          <span className="text-xs text-gray-400">{t('edit.contactSettings.noChannels')}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {t('edit.general.saveChannels')}
                  </button>
                </form>
              )}

              {generalSelection === 'audit' && (
                <div className="border border-gray-200 bg-gray-50/40">
                  <div className="border-b border-gray-200 bg-white px-4 py-3">
                    <p className="text-sm font-bold text-black">{t('edit.general.audit')}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{t('edit.general.auditHint')}</p>
                  </div>
                  {activityLog.length === 0 ? (
                    <p className="text-sm text-gray-400 p-6 text-center">{t('edit.general.auditEmpty')}</p>
                  ) : (
                    <ul className="divide-y divide-gray-200 max-h-[420px] overflow-y-auto">
                      {activityLog.map((entry) => (
                        <li key={entry.id} className="px-4 py-3 text-sm">
                          <p className="font-medium text-black">{entry.action}</p>
                          {entry.detail && <p className="text-gray-600 text-xs mt-0.5">{entry.detail}</p>}
                          <p className="text-[10px] text-gray-400 font-mono mt-1">{formatActivityTime(entry.at)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* HOME SLIDES */}
          {activeTab === 'home-slides' && (
            <form onSubmit={handleSaveHomeSlides} className="space-y-8">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-black mb-1">{t('edit.homeSlides.title')}</h2>
                <p className="text-gray-500 text-xs">{t('edit.homeSlides.desc')}</p>
              </div>

              <div className="border border-gray-200 bg-gray-50/40">
                <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-5">
                  <h3 className="text-sm font-bold tracking-tight text-black">{t('edit.homeSlides.feedTitleSection')}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{t('edit.homeSlides.feedTitleHint')}</p>
                </div>
                <div className="p-4 sm:p-5">
                  <label className="text-xs uppercase font-bold text-gray-500 tracking-wider block mb-1.5">
                    หัวข้อส่วนฟีด
                  </label>
                  <input
                    type="text"
                    value={brandForm.feedSectionTitle}
                    onChange={(e) => setBrandForm((prev) => ({ ...prev, feedSectionTitle: e.target.value }))}
                    className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full"
                    required
                  />
                </div>
              </div>

              <div className="rounded border border-gray-200 bg-gray-50 p-4 space-y-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-1">
                    {t('edit.homeSlides.sizeGuideTitle')}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatImageSizeGuide(SLIDE_DEFAULT_ASPECT_RATIO)}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    {t('edit.homeSlides.cropExplain')}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400">
                    {t('edit.homeSlides.previewFrameLabel')}
                  </p>
                  <div
                    className={`w-full max-w-[220px] ${aspectRatioClass(SLIDE_DEFAULT_ASPECT_RATIO)} relative border-2 border-black/70 bg-white overflow-hidden`}
                  >
                    <div className="absolute inset-2 border border-dashed border-black/20 pointer-events-none" />
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 font-medium">
                      4:3
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {slidesForm.map((slide) => (
                  <div key={slide.id} className="border border-gray-200 relative group">
                    <div className={`${aspectRatioClass(SLIDE_DEFAULT_ASPECT_RATIO)} relative bg-gray-100`}>
                      <Image src={slide.imageUrl} alt={slide.title} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover" unoptimized={shouldBypassImageOptimizer(slide.imageUrl)} referrerPolicy="no-referrer" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold truncate">{slide.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{stylePages.find((p) => p.id === slide.pageId)?.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveHomeSlide(slide.id)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border border-dashed border-gray-300 p-6 space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest">{t('edit.homeSlides.addSlide')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder={t('edit.homeSlides.slideTitle')}
                    value={newSlideTitle}
                    onChange={(e) => setNewSlideTitle(e.target.value)}
                    className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                  />
                  <select
                    value={newSlidePageId}
                    onChange={(e) => setNewSlidePageId(e.target.value)}
                    className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black bg-white"
                  >
                    {stylePages.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setSlideCropOpen(true)}
                  className="bg-gray-100 hover:bg-gray-200 text-black px-5 py-3 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2"
                >
                  <Upload size={14} />
                  {t('edit.homeSlides.uploadImage')}
                </button>
              </div>

              <button type="submit" className="bg-black text-white px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center gap-2">
                <Save size={16} />
                {t('common.save')}
              </button>
            </form>
          )}

          {/* MENUS — dropdown picks target */}
          {activeTab === 'menus' && (
            <div className="space-y-8">
              <MenuSettingsHeader
                selection={menuSelection}
                onSelectionChange={(v) => setMenuSelection(normalizeMenuSelection(v))}
                options={menuOptions}
                title={t('edit.menu.title')}
                description={t('edit.menu.desc')}
              />

              {menuSelection === 'home' && (
                <form onSubmit={handleSaveHomePage} className="space-y-4 max-w-2xl">
                  <SectionCard title="เมนูในแถบนำทาง" description="ชื่อลิงก์ไปหน้าแรก">
                    <Field label={t('edit.menu.homeLabel')} hint={t('edit.menu.homeHint')}>
                      <input
                        type="text"
                        value={brandForm.homeLabel}
                        onChange={(e) => setBrandForm((prev) => ({ ...prev, homeLabel: e.target.value }))}
                        className={inputClass}
                        required
                      />
                    </Field>
                  </SectionCard>

                  <SectionCard title="Hero หน้าแรก" description="บล็อกใหญ่ด้านบนหน้าแรก">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Field label="ป้ายสตูดิโอ" hint="เช่น สตูดิโอ 2026" className="lg:col-span-2">
                        <input
                          type="text"
                          value={brandForm.studioBadge}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, studioBadge: e.target.value }))}
                          className={inputClass}
                          required
                        />
                      </Field>
                      <Field label="หัวข้อ Hero" hint="ใช้ \\n ขึ้นบรรทัดใหม่">
                        <textarea
                          value={brandForm.heroTitle}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                          rows={3}
                          className={textareaClass}
                          required
                        />
                      </Field>
                      <Field label="คำอธิบาย Hero">
                        <textarea
                          value={brandForm.heroDescription}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, heroDescription: e.target.value }))}
                          rows={3}
                          className={textareaClass}
                          required
                        />
                      </Field>
                    </div>
                  </SectionCard>

                  <SectionCard title="ส่วนทีมงาน (หัวข้อ)" description="ข้อความเหนือรายชื่อทีม — รายชื่อแก้ที่ «ทีมงาน»">
                    <div className="space-y-4">
                      <Field label="หัวข้อส่วนทีม">
                        <input
                          type="text"
                          value={brandForm.teamSectionTitle}
                          onChange={(e) => setBrandForm((prev) => ({ ...prev, teamSectionTitle: e.target.value }))}
                          className={inputClass}
                          required
                        />
                      </Field>
                      <Field label="คำอธิบายส่วนทีม">
                        <textarea
                          value={brandForm.teamSectionDescription}
                          onChange={(e) =>
                            setBrandForm((prev) => ({ ...prev, teamSectionDescription: e.target.value }))
                          }
                          rows={2}
                          className={textareaClass}
                          required
                        />
                      </Field>
                    </div>
                  </SectionCard>

                  <p className="text-[11px] text-gray-400">
                    หัวข้อฟีดและสไลด์รูป แก้ที่ «สไลด์»
                  </p>

                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {t('edit.menu.saveHomePage')}
                  </button>
                </form>
              )}

              {menuSelection === 'contact' && (
                <form
                  onSubmit={handleSaveMenuContact}
                  className="border border-gray-200 bg-gray-50/40 p-4 sm:p-5 space-y-5 max-w-2xl"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs uppercase font-bold text-gray-500 tracking-wider">
                      {t('edit.menu.contactLabel')}
                    </label>
                    <p className="text-[10px] text-gray-400 min-h-[1.25rem] leading-snug">{t('edit.menu.contactHint')}</p>
                    <input
                      type="text"
                      value={contactForm.label}
                      onChange={(e) => setContactForm((prev) => ({ ...prev, label: e.target.value }))}
                      className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none transition-colors w-full"
                      required
                    />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 pt-2">ข้อความหน้าติดต่อ</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs uppercase font-bold text-gray-500">หัวข้อ Hero</label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem]">{'\u00a0'}</p>
                      <textarea
                        value={brandForm.contactHeroTitle}
                        onChange={(e) => setBrandForm((prev) => ({ ...prev, contactHeroTitle: e.target.value }))}
                        rows={2}
                        className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs uppercase font-bold text-gray-500">คำอธิบาย Hero</label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem]">{'\u00a0'}</p>
                      <textarea
                        value={brandForm.contactHeroDesc}
                        onChange={(e) => setBrandForm((prev) => ({ ...prev, contactHeroDesc: e.target.value }))}
                        rows={2}
                        className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500">หัวข้อช่องทางติดต่อ</label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem]">{'\u00a0'}</p>
                      <input
                        type="text"
                        value={brandForm.contactChannelsTitle}
                        onChange={(e) => setBrandForm((prev) => ({ ...prev, contactChannelsTitle: e.target.value }))}
                        className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500">คำอธิบายช่องทางติดต่อ</label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem]">{'\u00a0'}</p>
                      <textarea
                        value={brandForm.contactChannelsDesc}
                        onChange={(e) => setBrandForm((prev) => ({ ...prev, contactChannelsDesc: e.target.value }))}
                        rows={2}
                        className="border border-gray-200 bg-white focus:border-black p-3 text-sm focus:outline-none w-full"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Line / โทร / อีเมล ตั้งที่ «ตั้งค่าทั่วไป» → ช่องทางติดต่อ
                  </p>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {t('edit.menu.saveContact')}
                  </button>
                </form>
              )}

              {menuSelection === 'team' && (
                <div className="space-y-8 border-t border-gray-100 pt-2">
                  <div>
                    <h3 className="text-sm font-bold text-black">{t('edit.team.title')}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{t('edit.team.desc')}</p>
                  </div>

                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-gray-400 border border-dashed border-gray-300 p-6 text-center">
                      {t('edit.team.empty')}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {teamMembers.map((member) => (
                        <motion.div
                          key={member.id}
                          className="border border-gray-200 bg-white flex flex-col overflow-hidden"
                        >
                          <div className="relative aspect-square bg-gray-100">
                            <Image
                              src={member.imageUrl}
                              alt={member.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                              unoptimized={shouldBypassImageOptimizer(member.imageUrl)}
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-4 flex flex-col gap-3 flex-1">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase font-bold text-gray-400">{t('edit.team.nameLabel')}</label>
                              <input
                                type="text"
                                defaultValue={member.name}
                                onBlur={(e) => {
                                  const name = e.target.value.trim();
                                  if (name && name !== member.name) {
                                    updateTeamMember(member.id, { name });
                                    logEdit('แก้ไขทีมงาน', name);
                                    void showSaveWithSync();
                                  }
                                }}
                                className="border border-gray-200 p-2.5 text-sm focus:outline-none focus:border-black"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase font-bold text-gray-400">{t('edit.team.roleLabel')}</label>
                              <input
                                type="text"
                                defaultValue={member.role}
                                onBlur={(e) => {
                                  const role = e.target.value.trim();
                                  if (role !== member.role) {
                                    updateTeamMember(member.id, { role });
                                    logEdit('แก้ไขทีมงาน', member.name);
                                    void showSaveWithSync();
                                  }
                                }}
                                className="border border-gray-200 p-2.5 text-sm focus:outline-none focus:border-black"
                              />
                            </div>
                            <div className="flex gap-2 mt-auto pt-2">
                              <button
                                type="button"
                                onClick={() => openTeamCrop(member.id)}
                                className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-black text-gray-600 hover:text-black py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors"
                              >
                                <Upload size={12} />
                                {t('edit.team.changePhoto')}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(t('edit.team.deleteConfirm').replace('{name}', member.name))) {
                                    deleteTeamMember(member.id);
                                    logEdit('ลบสมาชิกทีม', member.name);
                                    showToast(t('edit.toast.teamMemberDeleted'));
                                  }
                                }}
                                className="p-2 border border-gray-200 hover:border-red-500 text-gray-400 hover:text-red-500 transition-colors"
                                title={t('common.delete')}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleAddTeamMember} className="border border-dashed border-gray-300 p-6 space-y-4">
                    <h3 className="text-xs uppercase font-bold tracking-widest text-gray-500">{t('edit.team.addMember')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase font-bold text-gray-500">{t('edit.team.nameLabel')}</label>
                        <input
                          type="text"
                          value={newTeamForm.name}
                          onChange={(e) => setNewTeamForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder={t('edit.team.namePlaceholder')}
                          className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase font-bold text-gray-500">{t('edit.team.roleLabel')}</label>
                        <input
                          type="text"
                          value={newTeamForm.role}
                          onChange={(e) => setNewTeamForm((prev) => ({ ...prev, role: e.target.value }))}
                          placeholder={t('edit.team.rolePlaceholder')}
                          className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => openTeamCrop(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-black px-5 py-3 text-xs font-semibold uppercase tracking-widest transition-colors flex items-center gap-2"
                      >
                        <Upload size={14} />
                        {newTeamForm.imageUrl ? t('edit.team.changePhoto') : t('edit.team.uploadPhoto')}
                      </button>
                      {newTeamForm.imageUrl && (
                        <div className="relative w-14 h-14 bg-gray-100 overflow-hidden border border-gray-200">
                          <Image
                            src={newTeamForm.imageUrl}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized={shouldBypassImageOptimizer(newTeamForm.imageUrl)}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                    >
                      <Plus size={16} /> {t('edit.team.addMember')}
                    </button>
                  </form>
                </div>
              )}

              {menuSelection === 'add-page' && (
                <form onSubmit={handleAddPage} className="space-y-6 border border-gray-200 bg-gray-50/40 p-4 sm:p-5 max-w-lg">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500">{t('edit.pageSettings.menuName')}</label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem] leading-snug">{t('edit.addPage.desc')}</p>
                      <input
                        type="text"
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                        className="border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:border-black"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs uppercase font-bold text-gray-500">{t('edit.pageSettings.description')}</label>
                      <p className="text-[10px] text-gray-400 min-h-[1.25rem] leading-snug">{'\u00a0'}</p>
                      <textarea
                        value={newPageDesc}
                        onChange={(e) => setNewPageDesc(e.target.value)}
                        rows={3}
                        className="border border-gray-200 bg-white p-3 text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                  >
                    <Plus size={16} /> {t('edit.tab.addPage')}
                  </button>
                </form>
              )}

              {activeStyleMenuId && (
            <div className="space-y-6 border-t border-gray-100 pt-8">
              <form onSubmit={handleSavePageSettings} className="space-y-4">
                <SectionCard
                  title={stylePages.find((p) => p.id === activeStyleMenuId)?.name ?? activeStyleMenuId}
                  description={t('edit.pageSettings.desc')}
                >
                  <div className="space-y-4 max-w-lg">
                    <Field label={t('edit.pageSettings.menuName')} hint="ชื่อในแถบนำทาง">
                      <input
                        type="text"
                        value={pageSettingsForm.name}
                        onChange={(e) => setPageSettingsForm((p) => ({ ...p, name: e.target.value }))}
                        className={inputClass}
                        required
                      />
                    </Field>
                    <Field label={t('edit.pageSettings.description')}>
                      <textarea
                        value={pageSettingsForm.description}
                        onChange={(e) => setPageSettingsForm((p) => ({ ...p, description: e.target.value }))}
                        rows={4}
                        className={textareaClass}
                      />
                    </Field>
                    <p className="text-xs text-gray-400 font-mono">URL: /{activeStyleMenuId}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 px-4 sm:px-5 pb-5 -mt-2">
                    <button
                      type="submit"
                      className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                    >
                      <Save size={16} /> {t('common.save')}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeletePageSettings}
                      disabled={stylePages.length <= 1}
                      className="border border-red-300 text-red-600 px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Trash2 size={16} /> ลบเมนูนี้
                    </button>
                  </div>
                </SectionCard>
              </form>

              <SectionCard title={t('edit.cards.title')} description={t('edit.cards.desc')}>
                <div className="flex justify-end -mt-2 mb-4">
                  <button
                    type="button"
                    onClick={() => openCreateCardModal(activeStyleMenuId)}
                    className="flex items-center gap-2 bg-black text-white px-5 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-neutral-800 transition-all duration-300 active:scale-95"
                  >
                    <Plus size={16} />
                    {t('edit.cards.addCard')}
                  </button>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <div 
                    key={room.id}
                    className="border border-gray-200 bg-white flex flex-col group relative overflow-hidden"
                  >
                    <div className={`w-full relative bg-gray-100 overflow-hidden ${aspectRatioClass(roomCoverAspectRatio(room))}`}>
                      <Image
                        key={`${room.id}-${room.imageUrl}`}
                        src={room.imageUrl}
                        alt={room.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        unoptimized={shouldBypassImageOptimizer(room.imageUrl)}
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] text-white uppercase tracking-wider font-bold">
                        {stylePages.find((p) => p.id === room.pageId)?.name || room.pageId}
                      </span>
                      {isValidFeaturedRank(room.featuredRank) && (
                        <span className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur-md px-2 py-0.5 text-[9px] text-black uppercase tracking-wider font-bold">
                          ★ ดาว {room.featuredRank}
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-sm text-black leading-tight line-clamp-1">
                          {room.name}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                          {room.price}
                        </p>
                        <p className="text-gray-400 text-[11px] line-clamp-2 mt-2 leading-relaxed">
                          {room.description}
                        </p>
                        {room.keywords.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {room.keywords.map((kw) => (
                              <span
                                key={kw}
                                className="bg-gray-100 text-gray-600 px-2 py-0.5 text-[9px] font-medium rounded-none"
                              >
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 border-t border-gray-100 pt-3 mt-4">
                        <button
                          onClick={() => openEditCardModal(room)}
                          className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 hover:border-black text-gray-600 hover:text-black py-2 text-xs font-semibold transition-colors uppercase tracking-widest text-[10px]"
                        >
                          <Edit size={12} />
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${room.name}"?`)) {
                              deleteRoom(room.id);
                            }
                          }}
                          className="p-2 border border-gray-200 hover:border-red-500 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete space card"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              </SectionCard>
            </div>
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-black mb-1">{t('edit.keywords.title')}</h2>
                <p className="text-gray-500 text-xs">{t('edit.keywords.desc')}</p>
              </div>

              {keywords.length === 0 ? (
                <p className="text-sm text-gray-400 border border-dashed border-gray-300 p-6 text-center">
                  {t('edit.keywords.empty')}
                </p>
              ) : (
                <div className="space-y-3">
                  {keywords.map((keyword) => {
                    const usageCount = rooms.filter((r) => r.keywords.includes(keyword.name)).length;
                    return (
                      <motion.div
                        key={keyword.id}
                        className="border border-gray-200 p-4 flex flex-col md:flex-row md:items-center gap-4"
                      >
                        <div className="flex-1 flex flex-col gap-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">{t('edit.keywords.nameLabel')}</label>
                          <input
                            type="text"
                            defaultValue={keyword.name}
                            onBlur={(e) => {
                              const name = e.target.value.trim();
                              if (name && name !== keyword.name) {
                                updateKeyword(keyword.id, name);
                                void showSaveWithSync();
                              }
                            }}
                            className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                          />
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <span className="text-xs text-gray-400">
                            {t('edit.keywords.usage')}: {usageCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(t('edit.keywords.deleteConfirm').replace('{name}', keyword.name))) {
                                deleteKeyword(keyword.id);
                                showToast(t('edit.toast.keywordDeleted'));
                              }
                            }}
                            className="p-2 border border-gray-200 hover:border-red-500 text-gray-400 hover:text-red-500 transition-colors"
                            title={t('common.delete')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <form onSubmit={handleAddKeyword} className="border border-gray-200 p-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs uppercase font-bold text-gray-500">{t('edit.keywords.addKeyword')}</label>
                  <input
                    type="text"
                    value={newKeywordName}
                    onChange={(e) => setNewKeywordName(e.target.value)}
                    placeholder={t('edit.keywords.namePlaceholder')}
                    className="border border-gray-200 p-3 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-black text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-neutral-800 flex items-center gap-2"
                >
                  <Plus size={16} /> {t('edit.keywords.addKeyword')}
                </button>
              </form>

              <p className="text-xs text-gray-400 leading-relaxed">{t('edit.keywords.cardHint')}</p>
            </div>
          )}

          {activeTab === 'analytics' && <EditAnalyticsPanel />}

        </div>
        {/* Live Preview Pane */}
        {mode === 'preview' && (
          <div className="lg:col-span-12 bg-white border border-gray-200 p-4 md:p-6 shadow-sm rounded-none flex flex-col max-h-[calc(100vh-8rem)]">
            <div className="flex flex-col gap-3 mb-4 shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{t('edit.livePreview')}</h2>
                  <p className="text-[11px] text-gray-500 mt-0.5">{t('edit.previewDraftHint')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewPage(contextPreviewPage)}
                  className="text-[10px] uppercase tracking-widest font-semibold border border-gray-300 px-3 py-1.5 hover:border-black transition-colors"
                >
                  {t('edit.previewGoToEditing')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <PreviewPageButton
                  active={previewPage === 'home'}
                  onClick={() => setPreviewPage('home')}
                  label={t('edit.group.home')}
                />
                <PreviewPageButton
                  active={previewPage === 'contact'}
                  onClick={() => setPreviewPage('contact')}
                  label={t('edit.menu.targetContact')}
                />
                <PreviewPageButton
                  active={previewPage === 'intro'}
                  onClick={() => setPreviewPage('intro')}
                  label={t('edit.general.intro')}
                />
                {stylePages.map((p) => (
                  <PreviewPageButton
                    key={p.id}
                    active={previewPage === p.id}
                    onClick={() => setPreviewPage(p.id)}
                    label={p.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-auto border border-gray-100 bg-gray-50/50">
              <EditPreviewProvider draft={previewDraft} previewPage={previewPage}>
                <PagePreview page={previewPage} />
              </EditPreviewProvider>
            </div>
          </div>
        )}
      </div>

      <CardFormModal
        open={isCardModalOpen}
        editingCard={editingCard}
        defaultPageId={cardModalPageId}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleCardSave}
      />

      <ImageUploadCrop
        open={slideCropOpen}
        onClose={() => setSlideCropOpen(false)}
        onComplete={handleAddHomeSlide}
        defaultAspectRatio={SLIDE_DEFAULT_ASPECT_RATIO}
        pickFileOnOpen
        showPreviewFrame
        lockAspectRatio
        previewFrameLabel={t('edit.homeSlides.previewFrameLabel')}
        cropHint={t('edit.homeSlides.cropHint')}
      />

      <ImageUploadCrop
        open={teamCropOpen}
        onClose={() => {
          setTeamCropOpen(false);
          setTeamCropTargetId(null);
        }}
        onComplete={handleTeamCropComplete}
        defaultAspectRatio="1:1"
        lockAspectRatio
        pickFileOnOpen
      />
    </div>
  );
}
