//
//  ViewController.m
//  Tessel2Go
//
//  Created by Bartosz Boron on 18.10.14.
//  Copyright (c) 2014 Senacor. All rights reserved.
//

#import "ViewController.h"
#import <MQTTKit.h>
#import <CoreMotion/CoreMotion.h>

@interface ViewController ()

@property IBOutlet UIButton *connectionLabel;
@property IBOutlet UILabel *connectionStatus;

@property (weak, nonatomic) IBOutlet UITextField *tempField;
@property (weak, nonatomic) IBOutlet UITextField *humField;
@property (weak, nonatomic) IBOutlet UITextField *lightField;
@property (strong, nonatomic) IBOutletCollection(UISwitch) NSArray *switches;
@property (strong, nonatomic) IBOutletCollection(UITextField) NSArray *fields;
@property (weak, nonatomic) IBOutlet UITextView *textView;

@property MQTTClient *client;
@property BOOL connected;

@property CMMotionManager *motionManager;

@end

@implementation ViewController


#pragma mark -
#pragma mark LIFECYCLE

- (void)viewDidLoad {
    [super viewDidLoad];
    
    /* ------ MQTT --------- */
    NSString *clientID = [[[UIDevice currentDevice] identifierForVendor] UUIDString];
    self.client = [[MQTTClient alloc] initWithClientId:clientID];
    [self.client setUsername:@"evnevuat"];
    [self.client setPassword:@"G4yO7QTrmogs"];
    [self.client setPort:19709];
    self.connected = NO;
    
    // define the handler that will be called when MQTT messages are received by the client
    [self.client setMessageHandler:^(MQTTMessage *message) {
        dispatch_async(dispatch_get_main_queue(), ^{
            [self addLog: message.payloadString];
            
            NSError *err;
            NSDictionary *data = [NSJSONSerialization JSONObjectWithData:message.payload options:0 error:&err];
            NSString *unit = [data objectForKey:@"unit"];
            if ([unit isEqualToString:@"C"]) {
                self.tempField.text = [NSString stringWithFormat:@"%@ %@", [data objectForKey:@"value"], unit];
            } else if ([unit isEqualToString:@"%"]) {
                self.humField.text = [NSString stringWithFormat:@"%@ %@", [data objectForKey:@"value"], unit];
            } else if ([unit isEqualToString:@"L"]) {
                self.lightField.text = [NSString stringWithFormat:@"%@ %@", [data objectForKey:@"value"], unit];
            }
        });
    }];
    
    /* ---------- MOTIONS -------- */
    self.motionManager = [[CMMotionManager alloc] init];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (void)viewWillDisappear:(BOOL)animated {
    if (self.connected) {
        [self disconnectFromMqtt];
    }
    [self stopMotionUpdate];
    self.textView.text = @"";
    
    [super viewWillDisappear:animated];
}

- (NSUInteger) supportedInterfaceOrientations {
    return UIInterfaceOrientationMaskPortrait;
}

- (BOOL) shouldAutorotate {
    return NO;
}

#pragma mark -
#pragma mark MQTT

- (void) connectToMqtt {
    NSString *host = @"m20.cloudmqtt.com";
    [self.client connectToHost:host
             completionHandler:^(MQTTConnectionReturnCode code) {
                 if (code == ConnectionAccepted) {
                     self.connected = YES;
                     dispatch_async(dispatch_get_main_queue(), ^{
                         [self addLog: [NSString stringWithFormat:@"connected to host: %@!", host]];
                         [self toggleConnectionStatus];
                         [[self.connectionLabel titleLabel] setText:@"Disconnect from MQTT"];
                     });
                 }
             }
     ];
}

- (void) disconnectFromMqtt {
    [self.client disconnectWithCompletionHandler:^(NSUInteger code) {
        // The client is disconnected when this completion handler is called
        self.connected = NO;
        dispatch_async(dispatch_get_main_queue(), ^{
            [self addLog: @"disconnected!"];
            [self resetUI];
            [self toggleConnectionStatus];
            [[self.connectionLabel titleLabel] setText:@"Connect from MQTT"];
            [self stopMotionUpdate];
        });
    }];
}

- (void) subscribeToTopic: (NSString *) topic {
    if (self.connected) {
        // when the client is connected, subscribe to the topic to receive message.
        [self.client subscribe:topic
         withCompletionHandler:^(NSArray *grantedQos) {
             dispatch_async(dispatch_get_main_queue(), ^{
                 [self addLog: [NSString stringWithFormat:@"Successfully subscribed to topic: %@!", topic]];
             });
         }];
    }
}

- (void) unSubscribeFromTopic: (NSString *) topic {
    if (self.connected) {
        // when the client is connected, subscribe to the topic to receive message.
        [self.client unsubscribe:topic
           withCompletionHandler:^{
               dispatch_async(dispatch_get_main_queue(), ^{
                   [self addLog: [NSString stringWithFormat:@"Successfully unsubscribed from topic: %@!", topic]];
               });
           }];
    }
}

- (IBAction)toggleConnection:(UIButton *)sender {
    if (self.connected) {
        [self disconnectFromMqtt];
    } else {
        [self connectToMqtt];
    }
}

- (void) toggleSubscription: (BOOL) senderState
                   forTopic: (NSString *) topic {
    if (senderState) {
        [self subscribeToTopic:topic];
    } else {
        [self unSubscribeFromTopic:topic];
    }
}

- (void) publishToTopic: (NSString *) topic aValue: (NSString *) value {
    if (self.connected) {
        [self.client publishString:value
                           toTopic:topic
                           withQos:AtMostOnce
                            retain:NO
                 completionHandler:^(int mid) {
                     dispatch_async(dispatch_get_main_queue(), ^{
                         [self addLog: [NSString stringWithFormat:@"Publishing value <%@> to topic: %@", value, topic]];
                     });
                 }];
    }
}

#pragma mark -
#pragma mark MOTION

- (void) startPublishingTilt {
    if (self.motionManager.isAccelerometerAvailable) {
        [self addLog:@"starting AccelerometerUpdates!"];
        [self.motionManager setAccelerometerUpdateInterval:0.5];
        [self.motionManager startAccelerometerUpdatesToQueue:[NSOperationQueue currentQueue] withHandler:^(CMAccelerometerData *accelerometerData, NSError *error) {
            CMAcceleration acceleration = accelerometerData.acceleration;
            [self publishToTopic:@"t_tilt" aValue: [NSString stringWithFormat:@"%f", acceleration.x]];
        }];
    } else {
        [self addLog:@"Accelerometer not available!"];
    }
    
}

- (void) stopMotionUpdate {
    if ([self.motionManager isAccelerometerActive]) {
        [self.motionManager stopAccelerometerUpdates];
        [self addLog:@"AccelerometerUpdates stopped!"];
    }
}



#pragma mark -
#pragma mark UI

- (void) toggleConnectionStatus {
    if (self.connected) {
        [self.connectionStatus setText:@"connected"];
    } else {
        [self.connectionStatus setText:@"disconnected"];
    }
}

- (IBAction)toggleTemp:(UISwitch *)sender {
    if (self.connected) {
        [self toggleSubscription: sender.on forTopic:@"t_temp"];
        if (!sender.on) {
            self.tempField.text = @"";
        }
    }
}

- (IBAction)toggleHum:(UISwitch *)sender {
    if (self.connected) {
        [self toggleSubscription: sender.on forTopic:@"t_hum"];
        if (!sender.on) {
            self.humField.text = @"";
        }
    }
}

- (IBAction)toggleLight:(UISwitch *)sender {
    if (self.connected) {
        [self toggleSubscription: sender.on forTopic:@"t_light"];
        if (!sender.on) {
            self.lightField.text = @"";
        }
    }
}

- (void) resetUI {
    for (UITextField *field in self.fields) {
        field.text = @"";
    }
    for (UISwitch *sw in self.switches) {
        [sw setOn:NO animated:YES];
    }
}

- (void) addLog: (NSString *) log {
    [self.textView insertText: [NSString stringWithFormat:@"%@ \n", log]];
    [self.textView scrollRangeToVisible:[self.textView selectedRange]];

}

- (IBAction)publishTilt {
    if (self.connected) {
        [self startPublishingTilt];
    } else {
        [self addLog:@"No connection!"];
    }
}

- (IBAction)stopPublishingTilt {
    [self stopMotionUpdate];
}

@end
