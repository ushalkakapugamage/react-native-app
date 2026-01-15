# MediSync Components Showcase

Development screen for testing all customized UI components.

## Access

Navigate to **Profile Tab → Components Showcase** (in the Support section)

Or directly navigate to: `/dev/components-showcase`

## What's Included

### 1. Buttons Section

**Variants Showcase:**
- Default (Primary Blue #72A8E8)
- Secondary (Coral #F8A978)
- Success (Green #4CAF50)
- Destructive (Red #EF5350)
- Outline
- Ghost
- Link

**Sizes Showcase:**
- Small
- Medium (default)
- Large
- Icon buttons (with Heart and Plus icons)

**States Showcase:**
- Loading state (interactive - click to test)
- Disabled state

**With Icons:**
- Button with left icon (Add Medication)
- Outline button with icon (Mark as Taken)

### 2. Inputs Section

**Input Variations:**
- Basic input (no label)
- Input with label
- Input with search icon
- Email input with Mail icon
- Password input with show/hide toggle
- Input with error state (red border + error message)
- Input with success state (green border + success message)
- Input with helper text

### 3. Cards Section

**Card Variants:**
- Default card (border only)
- Elevated card (with shadow)
- Outlined card (transparent with border)
- Pressable card (with press animation)

**Full Card Example:**
- CardHeader with CardTitle and CardDescription
- CardContent with medication info and badge
- CardFooter with action button

### 4. Badges Section

**Variants:**
- Default (gray)
- Success (green)
- Warning (orange)
- Danger (red)
- Info (blue)

**Sizes:**
- Small
- Medium
- Large

**With Dot Indicators:**
- Success with dot
- Warning with dot
- Danger with dot
- Info with dot

**Medication Status Examples:**
- Taken (success + dot)
- Missed (danger + dot)
- Upcoming (warning + dot)
- Scheduled (info + dot)

### 5. Avatars Section

**Sizes:**
- Small (32px)
- Medium (40px)
- Large (56px)
- X-Large (80px)

**With Status Indicators:**
- Online (green dot)
- Away (orange dot)
- Busy (red dot)
- Offline (gray dot)

**With Ring Border:**
- Avatars with primary color ring

**Avatar Group:**
- Multiple avatars with overlap
- Shows "+2" for overflow

### 6. Loading Spinners Section

**Sizes:**
- Small
- Medium
- Large

**With Text:**
- "Loading medications..."

**Custom Colors:**
- Green spinner with "Syncing..."
- Red spinner with "Error loading..."

**Mini Spinner:**
- Inline spinner for buttons/text

### 7. Combined Example

Real-world example showing:
- Avatar with status and ring
- Family member name and relationship
- Multiple badges (medications and health score)
- Two action buttons (outline and primary)

## Features Demonstrated

✅ **Theme Support** - All components work in light/dark mode
✅ **Haptic Feedback** - Buttons provide haptic feedback on press
✅ **Loading States** - Interactive loading state demo
✅ **Password Toggle** - Show/hide password functionality
✅ **Status Indicators** - Online/offline status on avatars
✅ **Press Animations** - Pressable cards with opacity change
✅ **Icon Integration** - lucide-react-native icons throughout
✅ **Semantic Colors** - MediSync color palette applied
✅ **Typography** - Consistent font sizes and weights
✅ **Spacing** - Proper padding and gaps

## Usage

```tsx
// Navigate from anywhere
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/dev/components-showcase');
```

## Purpose

This showcase serves as:
1. **Visual Reference** - See all component variants in one place
2. **Development Tool** - Test components during development
3. **Documentation** - Living examples of component usage
4. **Quality Assurance** - Verify theme changes affect all components
5. **Design Review** - Share with team for design approval

## Testing Checklist

When making changes to components, verify:
- [ ] All button variants render correctly
- [ ] Loading state works on button
- [ ] Input password toggle works
- [ ] Input error/success states display correctly
- [ ] Card shadows appear in light mode
- [ ] Badges use correct colors
- [ ] Avatar status indicators show
- [ ] Avatar group overflow works
- [ ] Spinners are centered
- [ ] All components work in dark mode
- [ ] Haptic feedback works on native
- [ ] Press animations are smooth

## Next Steps

To remove from production:
1. Delete `app/dev/` folder
2. Remove showcase link from profile screen
3. Or add environment check to hide in production

```tsx
// Hide in production
if (__DEV__) {
  // Show components showcase link
}
```

## Screenshots Location

Capture screenshots of this page for:
- Design documentation
- Component library reference
- Onboarding materials for new developers
