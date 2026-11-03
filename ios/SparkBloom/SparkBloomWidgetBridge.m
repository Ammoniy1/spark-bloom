#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(SparkBloomWidgetBridge, NSObject)

RCT_EXTERN_METHOD(updateState:(nonnull NSNumber *)steps
                  goalSteps:(nonnull NSNumber *)goalSteps
                  streakDays:(nonnull NSNumber *)streakDays
                  theme:(nonnull NSString *)theme)

@end
