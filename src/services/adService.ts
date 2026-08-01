import mobileAds, { RewardedAd, RewardedAdEventType, TestIds, AdEventType } from 'react-native-google-mobile-ads';

// Use test ID during development. In production, replace with your actual AdMob Rewarded Ad Unit ID.
const adUnitId = __DEV__ ? TestIds.REWARDED : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyy';

let rewardedAd: RewardedAd | null = null;
let adLoaded = false;

export const loadRewardedAd = async () => {
  // Ensure the SDK is initialized before attempting to load ads
  await mobileAds().initialize();

  adLoaded = false;
  rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
    keywords: ['productivity', 'tasks'],
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    adLoaded = true;
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, reward => {
    console.log('User earned reward of ', reward);
  });

  rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.error('Ad failed to load: ', error);
  });

  rewardedAd.load();
};

export const showRewardedAd = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!rewardedAd || !adLoaded) {
      // Ad isn't loaded yet. In a real app we might wait, but for now just fail gracefully.
      resolve(false);
      return;
    }

    let rewarded = false;

    rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      rewarded = true;
    });

    rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      resolve(rewarded);
      // Preload next ad
      loadRewardedAd();
    });

    rewardedAd.show();
  });
};
