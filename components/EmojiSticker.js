import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';

export default function EmojiSticker({imageSize, stickerSource}) {
    // 참고: https://medium.com/crossplatformkorea/%EC%9B%90%EB%A6%AC%EC%99%80-%EC%98%88%EC%A0%9C%EB%A5%BC-%ED%86%B5%ED%95%B4-react-native-reanimated-v2-%EC%9E%85%EB%AC%B8%ED%95%98%EA%B8%B0-336e832f6ed6
    // [Worklet]
    // - 애니매이션 부드럽게 만들라면 초당 60프레임 나와야하는데, UI Thread, JS Thread 사이에 커뮤니케이션 병목때매어려움
    // - V2에서 등장했는데, JS 함수인데 UI thread 내 독립된 context에서 동작
    // - JS Thread에서 파라미터 받아서 동작
    // - 목적 : UI 쓰레드에서 View Property 업데이트 or 이벤트에 반응 시 "UI THREAD 내부"에서 실행시킬 JS 코드
    // [SharedValue]
    // - 애니매이션 값 업데이트 내부분은 UI Thread
    // - 따라서 sharedValue 값은 UI Thread에서 읽히도록 최적화 됨
    // - JS Thread에서 sharedValue 값 변경 -> UI Thread에서 수행되도록 예약
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const scaleImage = useSharedValue(imageSize);

    const doubleTap = Gesture.Tap()
        .numberOfTaps(2)
        .onStart(() => {
            if (scaleImage.value !== imageSize * 2) {
                scaleImage.value = scaleImage.value * 2
            }
        });

    const drag = Gesture.Pan()
        .onChange((event) => {
            translateX.value += event.changeX;
            translateY.value += event.changeY;
        });

    const imageStyle = useAnimatedStyle(() => {
        return {
            width: withSpring(scaleImage.value),
            height: withSpring(scaleImage.value),
        }
    });

    const containerStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: translateX.value,
                },
                {
                    translateY: translateY.value,
                }
            ]
        }
    })

    return (
        <GestureDetector gesture={drag}>
            <Animated.View style={[containerStyle, {top: -350}]}>
                <GestureDetector gesture={doubleTap}>
                    <Animated.Image
                        source={stickerSource}
                        resizeMode="contain"
                        style={[imageStyle, {width: imageSize, height: imageSize}]}
                    />
                </GestureDetector>
            </Animated.View>
        </GestureDetector>
    );
}
