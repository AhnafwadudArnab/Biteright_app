import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface BtnProps {
    bgcolor: string;
    btnlabel: string;
    TextColor: string;
    Pressable: () => void;
    props?: any;
}

export default function Btn({ bgcolor, btnlabel, TextColor, Pressable }: BtnProps) {
    return (
        <View style={{ alignItems: "center", justifyContent: "center" }}>
            <TouchableOpacity
                onPress={Pressable}
                style={{
                    paddingRight: 40,
                    paddingLeft: 40,
                    backgroundColor: bgcolor,
                    paddingVertical: 12,
                    paddingHorizontal: 32,
                    borderRadius: 100,
                    marginTop: 20,
                    width: 250,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Text
                    style={{
                        color: TextColor,
                        fontSize: 16,
                        fontWeight: "bold",
                    }}
                >
                    {btnlabel}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
