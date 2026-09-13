import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  ChefHat, 
  Clock, 
  Flame, 
  Utensils, 
  FileText, 
  FileCode, 
  Check, 
  AlertCircle,
  Download,
  ListPlus,
  Video,
  Play,
  ExternalLink,
  Timer as TimerIcon
} from 'lucide-react';
import { 
  Recipe, 
  MealType, 
  Difficulty, 
  DietaryTag, 
  Ingredient, 
  InstructionStep 
} from '../types';
import { extractYoutubeId } from '../utils/youtube';

interface AddRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveRecipe: (recipe: Recipe) => void;
  onImportRecipes: (recipes: Recipe[]) => void;
  editingRecipe?: Recipe | null;
}

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Italian Pasta', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80' },
  { label: 'Artisanal Pizza', url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80' },
  { label: 'Fresh Salad', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Steak & Meat', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  { label: 'Curry & Rice', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dessert & Sweets', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' },
  { label: 'Breakfast Pancakes', url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80' },
  { label: 'Warm Soup & Stew', url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80' }
];

const DIETARY_OPTIONS: DietaryTag[] = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'High-Protein',
  'Low-Calorie',
  'Low-Carb',
  'Nut-Free'
];

const INGREDIENT_CATEGORIES = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Pantry & Spices',
  'Bakery & Grains',
  'Oils & Condiments',
  'Other'
];

export const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  isOpen,
  onClose,
  onSaveRecipe,
  onImportRecipes,
  editingRecipe
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'create' | 'upload' | 'quick-text'>('create');
  
  // Basic Form State
  const [title, setTitle] = useState(editingRecipe?.title || '');
  const [tagline, setTagline] = useState(editingRecipe?.tagline || '');
  const [description, setDescription] = useState(editingRecipe?.description || '');
  const [cuisine, setCuisine] = useState(editingRecipe?.cuisine || 'American');
  const [mealType, setMealType] = useState<MealType>(editingRecipe?.mealType || 'dinner');
  const [difficulty, setDifficulty] = useState<Difficulty>(editingRecipe?.difficulty || 'Medium');
  const [author, setAuthor] = useState(editingRecipe?.author || 'You');
  const [prepTime, setPrepTime] = useState<number>(editingRecipe?.prepTime || 15);
  const [cookTime, setCookTime] = useState<number>(editingRecipe?.cookTime || 25);
  const [servings, setServings] = useState<number>(editingRecipe?.servings || 4);
  const [calories, setCalories] = useState<number>(editingRecipe?.calories || 450);
  const [image, setImage] = useState(editingRecipe?.image || SAMPLE_PHOTO_PRESETS[0].url);
  const [dietary, setDietary] = useState<DietaryTag[]>(
    (editingRecipe?.dietary as DietaryTag[]) || []
  );

  // Dynamic Ingredients State
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    editingRecipe?.ingredients || [
      { name: 'Olive oil', amount: 2, unit: 'tbsp', category: 'Oils & Condiments' },
      { name: 'Garlic cloves, minced', amount: 3, unit: 'cloves', category: 'Produce' }
    ]
  );

  // Dynamic Instructions State
  const [instructions, setInstructions] = useState<InstructionStep[]>(
    editingRecipe?.instructions || [
      { stepNumber: 1, title: 'Prep the Ingredients', instruction: 'Chop and measure all ingredients before beginning.' },
      { stepNumber: 2, title: 'Cook & Simmer', instruction: 'Heat olive oil in a pan over medium heat and sauté aromatics.', timerMinutes: 5 }
    ]
  );

  // Pro tips & Pairing
  const [chefTipsText, setChefTipsText] = useState(editingRecipe?.chefTips?.join('\n') || '');
  const [pairing, setPairing] = useState(editingRecipe?.pairing || '');
  const [youtubeUrl, setYoutubeUrl] = useState(editingRecipe?.youtubeUrl || '');

  // Nutrition State
  const [protein, setProtein] = useState<number>(editingRecipe?.nutrition?.protein || 20);
  const [carbs, setCarbs] = useState<number>(editingRecipe?.nutrition?.carbs || 35);
  const [fat, setFat] = useState<number>(editingRecipe?.nutrition?.fat || 15);
  const [fiber, setFiber] = useState<number>(editingRecipe?.nutrition?.fiber || 4);

  // Upload file & JSON state
  const [jsonInput, setJsonInput] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [quickPasteText, setQuickPasteText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageUploadRef = useRef<HTMLInputElement | null>(null);

  // Reset and populate form fields when editingRecipe or isOpen changes
  useEffect(() => {
    if (isOpen) {
      if (editingRecipe) {
        setTitle(editingRecipe.title || '');
        setTagline(editingRecipe.tagline || '');
        setDescription(editingRecipe.description || '');
        setCuisine(editingRecipe.cuisine || 'American');
        setMealType(editingRecipe.mealType || 'dinner');
        setDifficulty(editingRecipe.difficulty || 'Medium');
        setAuthor(editingRecipe.author || 'You');
        setPrepTime(editingRecipe.prepTime || 15);
        setCookTime(editingRecipe.cookTime || 25);
        setServings(editingRecipe.servings || 4);
        setCalories(editingRecipe.calories || 450);
        setImage(editingRecipe.image || SAMPLE_PHOTO_PRESETS[0].url);
        setDietary((editingRecipe.dietary as DietaryTag[]) || []);
        setIngredients(
          editingRecipe.ingredients && editingRecipe.ingredients.length > 0
            ? editingRecipe.ingredients
            : [
                { name: 'Olive oil', amount: 2, unit: 'tbsp', category: 'Oils & Condiments' },
                { name: 'Garlic cloves, minced', amount: 3, unit: 'cloves', category: 'Produce' }
              ]
        );
        setInstructions(
          editingRecipe.instructions && editingRecipe.instructions.length > 0
            ? editingRecipe.instructions
            : [
                { stepNumber: 1, title: 'Prep the Ingredients', instruction: 'Chop and measure all ingredients before beginning.' },
                { stepNumber: 2, title: 'Cook & Simmer', instruction: 'Heat olive oil in a pan over medium heat and sauté aromatics.', timerMinutes: 5 }
              ]
        );
        setChefTipsText(editingRecipe.chefTips?.join('\n') || '');
        setPairing(editingRecipe.pairing || '');
        setYoutubeUrl(editingRecipe.youtubeUrl || '');
        setProtein(editingRecipe.nutrition?.protein || 20);
        setCarbs(editingRecipe.nutrition?.carbs || 35);
        setFat(editingRecipe.nutrition?.fat || 15);
        setFiber(editingRecipe.nutrition?.fiber || 4);
      } else {
        // Fresh blank creation
        setTitle('');
        setTagline('');
        setDescription('');
        setCuisine('American');
        setMealType('dinner');
        setDifficulty('Medium');
        setAuthor('You');
        setPrepTime(15);
        setCookTime(25);
        setServings(4);
        setCalories(450);
        setImage(SAMPLE_PHOTO_PRESETS[0].url);
        setDietary([]);
        setIngredients([
          { name: 'Olive oil', amount: 2, unit: 'tbsp', category: 'Oils & Condiments' },
          { name: 'Garlic cloves, minced', amount: 3, unit: 'cloves', category: 'Produce' }
        ]);
        setInstructions([
          { stepNumber: 1, title: 'Prep the Ingredients', instruction: 'Chop and measure all ingredients before beginning.' },
          { stepNumber: 2, title: 'Cook & Simmer', instruction: 'Heat olive oil in a pan over medium heat and sauté aromatics.', timerMinutes: 5 }
        ]);
        setChefTipsText('');
        setPairing('');
        setYoutubeUrl('');
        setProtein(20);
        setCarbs(35);
        setFat(15);
        setFiber(4);
      }
      setUploadError(null);
      setUploadSuccess(null);
    }
  }, [editingRecipe, isOpen]);

  // Toggle dietary chip
  const toggleDietaryTag = (tag: DietaryTag) => {
    setDietary(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Add / Remove / Change Ingredient
  const handleAddIngredient = () => {
    setIngredients(prev => [
      ...prev,
      { name: '', amount: 1, unit: 'cup', category: 'Produce' }
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    setIngredients(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Add / Remove / Change Instruction
  const handleAddStep = () => {
    setInstructions(prev => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        title: `Step ${prev.length + 1}`,
        instruction: ''
      }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    setInstructions(prev => 
      prev
        .filter((_, i) => i !== index)
        .map((step, idx) => ({ ...step, stepNumber: idx + 1 }))
    );
  };

  const handleUpdateStep = (index: number, field: keyof InstructionStep, value: any) => {
    setInstructions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Handle local image file upload (converts to base64 data URL)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WebP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImage(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle quick paste text parsing
  const handleParseQuickText = () => {
    if (!quickPasteText.trim()) return;

    const lines = quickPasteText.split('\n').map(l => l.trim()).filter(Boolean);
    const parsedIngredients: Ingredient[] = [];
    const parsedSteps: InstructionStep[] = [];
    let parsingSection: 'unknown' | 'ingredients' | 'instructions' = 'unknown';

    lines.forEach(line => {
      const lower = line.toLowerCase();
      if (lower.includes('ingredient')) {
        parsingSection = 'ingredients';
        return;
      }
      if (lower.includes('instruction') || lower.includes('direction') || lower.includes('method') || lower.includes('step')) {
        parsingSection = 'instructions';
        return;
      }

      if (parsingSection === 'ingredients') {
        // Try parsing line like "2 tbsp olive oil" or "1/2 cup sugar"
        const clean = line.replace(/^[-*•\d.]+\s*/, '');
        parsedIngredients.push({
          name: clean,
          amount: 1,
          unit: 'item',
          category: 'Produce'
        });
      } else if (parsingSection === 'instructions') {
        const clean = line.replace(/^[-*•\d.)]+\s*/, '');
        parsedSteps.push({
          stepNumber: parsedSteps.length + 1,
          title: `Step ${parsedSteps.length + 1}`,
          instruction: clean
        });
      } else {
        // Check for YouTube link
        if (line.includes('youtube.com/') || line.includes('youtu.be/')) {
          setYoutubeUrl(line.trim());
          return;
        }

        // Fallback default
        if (line.match(/^[-*•]/) || line.match(/^\d+\s*(cup|tbsp|tsp|g|oz|lb|clove)/i)) {
          parsedIngredients.push({
            name: line.replace(/^[-*•]\s*/, ''),
            amount: 1,
            unit: 'portion',
            category: 'Produce'
          });
        }
      }
    });

    if (parsedIngredients.length > 0) setIngredients(parsedIngredients);
    if (parsedSteps.length > 0) setInstructions(parsedSteps);

    setActiveTab('create');
    setUploadSuccess(`Extracted ${parsedIngredients.length} ingredients and ${parsedSteps.length} steps!`);
    setTimeout(() => setUploadSuccess(null), 3000);
  };

  // Handle JSON file upload
  const handleJSONFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        processImportedData(parsed);
      } catch (err: any) {
        setUploadError(`Failed to parse JSON file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteJSONImport = () => {
    setUploadError(null);
    setUploadSuccess(null);
    try {
      if (!jsonInput.trim()) {
        setUploadError('Please paste JSON data first.');
        return;
      }
      const parsed = JSON.parse(jsonInput);
      processImportedData(parsed);
    } catch (err: any) {
      setUploadError(`Invalid JSON format: ${err.message}`);
    }
  };

  const processImportedData = (data: any) => {
    const items = Array.isArray(data) ? data : [data];
    const validRecipes: Recipe[] = [];

    items.forEach((item, idx) => {
      if (!item.title) return;
      const newRecipe: Recipe = {
        id: item.id || `custom-recipe-${Date.now()}-${idx}`,
        title: item.title,
        tagline: item.tagline || 'Homemade Culinary Creation',
        description: item.description || 'A delicious home-cooked dish.',
        image: item.image || SAMPLE_PHOTO_PRESETS[0].url,
        cuisine: item.cuisine || 'American',
        mealType: item.mealType || 'dinner',
        difficulty: item.difficulty || 'Medium',
        prepTime: Number(item.prepTime) || 15,
        cookTime: Number(item.cookTime) || 20,
        totalTime: (Number(item.prepTime) || 15) + (Number(item.cookTime) || 20),
        servings: Number(item.servings) || 4,
        calories: Number(item.calories) || 450,
        rating: Number(item.rating) || 5.0,
        reviewCount: Number(item.reviewCount) || 1,
        author: item.author || 'You',
        dietary: item.dietary || [],
        ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
        instructions: Array.isArray(item.instructions) ? item.instructions : [],
        nutrition: item.nutrition || { calories: 450, protein: 20, carbs: 40, fat: 15, fiber: 3 },
        chefTips: item.chefTips || [],
        pairing: item.pairing || '',
        youtubeUrl: item.youtubeUrl || item.videoUrl || item.video || undefined,
        isCustom: true
      };
      validRecipes.push(newRecipe);
    });

    if (validRecipes.length === 0) {
      setUploadError('No valid recipe objects found in the JSON file.');
      return;
    }

    onImportRecipes(validRecipes);
    setUploadSuccess(`Successfully imported ${validRecipes.length} recipe(s)!`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Download Sample Template
  const handleDownloadSampleJSON = () => {
    const sample = [
      {
        title: 'Grandma’s Rustic Garlic Roast Chicken',
        tagline: 'Crispy skin, golden herb-infused garlic butter',
        description: 'A comforting, juicy roast chicken with roasted root vegetables and rosemary gravy.',
        image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80',
        youtubeUrl: 'https://www.youtube.com/watch?v=5rV3p2hJ7lQ', // (Optional: YouTube video tutorial URL)
        cuisine: 'French',
        mealType: 'dinner',
        difficulty: 'Medium',
        prepTime: 20,
        cookTime: 60,
        servings: 4,
        calories: 520,
        author: 'Your Name',
        dietary: ['Gluten-Free', 'High-Protein'],
        ingredients: [
          { name: 'Whole chicken', amount: 1, unit: 'whole (4 lbs)', category: 'Meat & Seafood' },
          { name: 'Butter, softened', amount: 4, unit: 'tbsp', category: 'Dairy & Eggs' },
          { name: 'Fresh rosemary & thyme', amount: 4, unit: 'sprigs', category: 'Produce' },
          { name: 'Garlic heads, halved', amount: 2, unit: 'heads', category: 'Produce' }
        ],
        instructions: [
          { stepNumber: 1, title: 'Preheat Oven & Season', instruction: 'Preheat oven to 400°F (200°C). Pat chicken dry and rub with garlic butter.', timerMinutes: 5 },
          { stepNumber: 2, title: 'Roast to Golden Perfection', instruction: 'Roast in a cast iron skillet for 60 minutes until internal temp reaches 165°F.', timerMinutes: 60 }
        ],
        nutrition: { calories: 520, protein: 48, carbs: 6, fat: 34, fiber: 1 },
        chefTips: ['Baste with pan drippings every 20 minutes for extra crispy skin.'],
        pairing: 'Crisp French Chardonnay or Pinot Noir'
      }
    ];

    const blob = new Blob([JSON.stringify(sample, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_recipe_template.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Submit manual creation
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a recipe title.');
      return;
    }

    const tipsArray = chefTipsText
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean);

    const recipeObj: Recipe = {
      id: editingRecipe?.id || `custom-recipe-${Date.now()}`,
      title: title.trim(),
      tagline: tagline.trim() || 'Signature Homemade Dish',
      description: description.trim() || 'A delicious, customized home recipe.',
      image: image.trim() || SAMPLE_PHOTO_PRESETS[0].url,
      cuisine: cuisine.trim() || 'American',
      mealType,
      difficulty,
      prepTime: Number(prepTime) || 15,
      cookTime: Number(cookTime) || 20,
      totalTime: (Number(prepTime) || 15) + (Number(cookTime) || 20),
      servings: Number(servings) || 4,
      calories: Number(calories) || 400,
      rating: editingRecipe?.rating || 5.0,
      reviewCount: editingRecipe?.reviewCount || 1,
      author: author.trim() || 'You',
      dietary,
      ingredients: ingredients.filter(i => i.name.trim()),
      instructions: instructions.filter(i => i.instruction.trim()),
      nutrition: {
        calories: Number(calories) || 400,
        protein: Number(protein) || 20,
        carbs: Number(carbs) || 30,
        fat: Number(fat) || 15,
        fiber: Number(fiber) || 3
      },
      chefTips: tipsArray,
      pairing: pairing.trim() || undefined,
      youtubeUrl: youtubeUrl.trim() || undefined,
      isCustom: true
    };

    onSaveRecipe(recipeObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div 
        id="add-recipe-modal-container"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-xs">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg text-stone-900">
                {editingRecipe ? 'Edit Custom Recipe' : 'Add & Upload Custom Recipe'}
              </h2>
              <p className="text-xs text-stone-500">
                Create new dishes, upload custom photos, or import JSON recipe files
              </p>
            </div>
          </div>

          <button
            id="btn-close-add-recipe-modal"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        {!editingRecipe && (
          <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'create'
                  ? 'bg-white border-stone-200 text-amber-700 -mb-px'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Recipe Builder Form</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white border-stone-200 text-amber-700 -mb-px'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Import JSON File</span>
            </button>

            <button
              onClick={() => setActiveTab('quick-text')}
              className={`px-4 py-2 text-xs font-bold rounded-t-xl border-t border-x transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'quick-text'
                  ? 'bg-white border-stone-200 text-amber-700 -mb-px'
                  : 'border-transparent text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quick Paste Text</span>
            </button>
          </div>
        )}

        {/* Content Container */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-6">
          {/* TAB 1: FORM BUILDER */}
          {activeTab === 'create' && (
            <form id="recipe-builder-form" onSubmit={handleSave} className="space-y-6">
              {/* Photo & Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Photo Upload & Preview */}
                <div className="md:col-span-4 space-y-3">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Recipe Cover Photo
                  </label>
                  
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 group">
                    <img
                      src={image}
                      alt="Recipe Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={() => setImage(SAMPLE_PHOTO_PRESETS[0].url)}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => imageUploadRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg bg-white/90 text-stone-900 text-xs font-bold shadow-md hover:bg-white transition-colors cursor-pointer"
                      >
                        Upload Local Photo
                      </button>
                    </div>
                  </div>

                  {/* Hidden file input for photo upload */}
                  <input
                    ref={imageUploadRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => imageUploadRef.current?.click()}
                      className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                  </div>

                  {/* Photo Presets Selector */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-stone-500">Or choose a preset photo:</span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {SAMPLE_PHOTO_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImage(preset.url)}
                          title={preset.label}
                          className="aspect-square rounded-lg overflow-hidden border border-stone-200 hover:ring-2 hover:ring-amber-500 cursor-pointer"
                        >
                          <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                      Or Paste Image URL:
                    </label>
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                </div>

                {/* Primary Info */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Recipe Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Mom’s Secret Truffle Risotto"
                      className="w-full px-4 py-2 text-sm bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Catchy Subtitle / Tagline
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g., Creamy Arborio rice with wild chanterelles"
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                        Chef / Author Name
                      </label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="e.g., Chef Alex or Your Name"
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                      Short Description & Story
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what makes this dish special, flavor notes, texture, or heritage..."
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none"
                    />
                  </div>

                  {/* Cuisines & Meal Types */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Cuisine
                      </label>
                      <input
                        type="text"
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        placeholder="Italian, French..."
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Meal Type
                      </label>
                      <select
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value as MealType)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-stone-200"
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="dessert">Dessert</option>
                        <option value="soup-salad">Soup & Salad</option>
                        <option value="appetizer-snack">Appetizer</option>
                        <option value="beverage">Beverage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white rounded-xl border border-stone-200"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Base Servings
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={servings}
                        onChange={(e) => setServings(Number(e.target.value) || 1)}
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>

                  {/* Times and Calories */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Prep Time (mins)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={prepTime}
                        onChange={(e) => setPrepTime(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Cook Time (mins)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={cookTime}
                        onChange={(e) => setCookTime(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">
                        Calories (kcal)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={calories}
                        onChange={(e) => setCalories(Number(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 text-xs bg-white rounded-xl border border-stone-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dietary Tags Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Dietary Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DIETARY_OPTIONS.map(tag => {
                    const isSelected = dietary.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleDietaryTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {isSelected ? `✓ ${tag}` : tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ingredients Builder */}
              <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Ingredients List ({ingredients.length})
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Specify exact amounts for automatic serving scaling and grocery exporting
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Ingredient</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {ingredients.map((ing, idx) => (
                    <div key={idx} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2.5 rounded-xl border border-stone-200">
                      <input
                        type="number"
                        step="any"
                        placeholder="Amount"
                        value={ing.amount || ''}
                        onChange={(e) => handleUpdateIngredient(idx, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2.5 py-1 text-xs bg-stone-50 rounded-lg border border-stone-200"
                      />
                      <input
                        type="text"
                        placeholder="Unit (tbsp, g, cup)"
                        value={ing.unit}
                        onChange={(e) => handleUpdateIngredient(idx, 'unit', e.target.value)}
                        className="w-28 px-2.5 py-1 text-xs bg-stone-50 rounded-lg border border-stone-200"
                      />
                      <input
                        type="text"
                        placeholder="Ingredient Name (e.g., Grated Pecorino Romano)"
                        value={ing.name}
                        onChange={(e) => handleUpdateIngredient(idx, 'name', e.target.value)}
                        className="flex-1 min-w-[150px] px-2.5 py-1 text-xs bg-stone-50 rounded-lg border border-stone-200 font-medium"
                      />
                      <select
                        value={ing.category || 'Produce'}
                        onChange={(e) => handleUpdateIngredient(idx, 'category', e.target.value)}
                        className="w-32 px-2 py-1 text-[11px] bg-stone-50 rounded-lg border border-stone-200 text-stone-700"
                      >
                        {INGREDIENT_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        disabled={ingredients.length <= 1}
                        className="p-1.5 text-stone-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                        title="Remove ingredient"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions Builder */}
              <div className="space-y-3 bg-stone-50/70 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Step-by-Step Cooking Method ({instructions.length})
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Add clear step titles, instructions, and interactive culinary timers
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Step</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {instructions.map((step, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            placeholder="Step Title (e.g., Sear the Protein)"
                            value={step.title}
                            onChange={(e) => handleUpdateStep(idx, 'title', e.target.value)}
                            className="flex-1 px-2.5 py-1 text-xs bg-stone-50 rounded-lg border border-stone-200 font-semibold"
                          />
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-stone-500 flex items-center gap-1">
                            <TimerIcon className="w-3 h-3 text-amber-600" />
                            Timer (min):
                          </span>
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={step.timerMinutes || ''}
                            onChange={(e) => handleUpdateStep(idx, 'timerMinutes', parseInt(e.target.value) || undefined)}
                            className="w-16 px-2 py-1 text-xs bg-stone-50 rounded-lg border border-stone-200"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(idx)}
                            disabled={instructions.length <= 1}
                            className="p-1 text-stone-400 hover:text-rose-600 disabled:opacity-30 cursor-pointer ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={2}
                        placeholder="Detailed instructions for this step..."
                        value={step.instruction}
                        onChange={(e) => handleUpdateStep(idx, 'instruction', e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-200 focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Chef Tips & Beverage Pairing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Chef's Pro Tips (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={chefTipsText}
                    onChange={(e) => setChefTipsText(e.target.value)}
                    placeholder="Tip 1: Always salt your pasta water generously&#10;Tip 2: Rest meat before slicing..."
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Beverage Pairing Suggestion
                  </label>
                  <textarea
                    rows={3}
                    value={pairing}
                    onChange={(e) => setPairing(e.target.value)}
                    placeholder="e.g., A chilled glass of Crisp Sauvignon Blanc or artisanal sparkling lemonade."
                    className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* YouTube Video URL Tagging (Optional) */}
              <div className="bg-stone-50 border border-stone-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider">
                          Video Cooking Tutorial
                        </label>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200/80 text-stone-700 uppercase tracking-wider">
                          Optional
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Link a YouTube cooking video or masterclass tutorial. You can leave this blank if you don't have one!
                      </p>
                    </div>
                  </div>

                  {youtubeUrl && (
                    <button
                      type="button"
                      onClick={() => setYoutubeUrl('')}
                      className="text-stone-400 hover:text-red-600 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      title="Clear video link"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove Video</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <div className="relative w-full">
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=... or youtu.be/...)"
                      className="w-full pl-3.5 pr-8 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    {youtubeUrl && (
                      <button
                        type="button"
                        onClick={() => setYoutubeUrl('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {youtubeUrl && extractYoutubeId(youtubeUrl) ? (
                    <div className="shrink-0 flex items-center gap-2">
                      <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        Valid Video Link
                      </span>
                      <a
                        href={`https://www.youtube.com/watch?v=${extractYoutubeId(youtubeUrl)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-xs"
                        title="Test link on YouTube"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Test</span>
                      </a>
                    </div>
                  ) : youtubeUrl.trim() ? (
                    <span className="shrink-0 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Check URL format
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setYoutubeUrl('https://www.youtube.com/watch?v=4d_s_mS9b_Y')}
                      className="shrink-0 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 text-stone-600 text-[11px] font-medium border border-stone-200 transition-colors"
                      title="Add a sample cooking video"
                    >
                      + Add Sample Video Link
                    </button>
                  )}
                </div>

                {/* Live Video Preview Box if Valid Video Linked */}
                {youtubeUrl && extractYoutubeId(youtubeUrl) && (
                  <div className="bg-white rounded-xl p-3 border border-stone-200 flex items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-9 rounded-lg bg-stone-900 overflow-hidden relative shrink-0 border border-stone-200">
                        <img 
                          src={`https://img.youtube.com/vi/${extractYoutubeId(youtubeUrl)}/mqdefault.jpg`}
                          alt="Video thumbnail preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-3.5 h-3.5 fill-white text-white drop-shadow-xs" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <span>YouTube Tutorial Attached</span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            (ID: {extractYoutubeId(youtubeUrl)})
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          This video will play inline inside the recipe viewer and Cook Mode PiP player.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setYoutubeUrl('')}
                      className="px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {!youtubeUrl && (
                  <p className="text-[11px] text-stone-400 italic">
                    Note: A video tutorial is completely optional. Your recipe will still feature ingredients, timers, step checklists, and nutrition.
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-recipe-submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingRecipe ? 'Save Recipe Changes' : 'Publish & Save Recipe'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: UPLOAD & IMPORT FILE */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Drag & Drop Box */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-amber-500 bg-stone-50 hover:bg-amber-50/40 p-8 rounded-3xl text-center cursor-pointer transition-all space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="font-serif font-bold text-base text-stone-800">
                  Click to Upload Recipe JSON File
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Import recipe files exported from this app or formatted in standard JSON structure.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleJSONFileUpload}
                  className="hidden"
                />
              </div>

              {/* Alerts */}
              {uploadError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Paste Raw JSON */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-amber-600" />
                    <span>Or Paste Raw JSON Code</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleDownloadSampleJSON}
                    className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sample JSON</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste recipe JSON object or array here..."
                  className="w-full p-3 font-mono text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:bg-white"
                />

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handlePasteJSONImport}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Import JSON Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUICK PASTE TEXT PARSER */}
          {activeTab === 'quick-text' && (
            <div className="space-y-4">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed">
                <strong>💡 Quick Text Import:</strong> Paste recipe text copied from notes, culinary blogs, or family cards. The smart extractor will parse ingredients and cooking steps automatically!
              </div>

              <textarea
                rows={10}
                value={quickPasteText}
                onChange={(e) => setQuickPasteText(e.target.value)}
                placeholder="Ingredients:&#10;2 cups flour&#10;1 tsp salt&#10;3 eggs&#10;&#10;Instructions:&#10;1. Mix dry ingredients in a bowl.&#10;2. Add eggs and whisk until smooth.&#10;3. Cook on a buttered skillet for 3 minutes."
                className="w-full p-4 text-xs bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:bg-white leading-relaxed"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseQuickText}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Parse into Form Builder</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
