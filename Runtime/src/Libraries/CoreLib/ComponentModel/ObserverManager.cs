// ObserverManager.cs
// Script#/Libraries/CoreLib
// This source code is subject to terms and conditions of the Apache License, Version 2.0.
//

using System;
using System.Runtime.CompilerServices;

namespace System.ComponentModel {
    [ScriptNamespace("ss")]
    [ScriptName("Observable")]
	[Imported(IsRealType = true)]
    public static class ObserverManager {

        public static IDisposable RegisterObserver(IObserver observer) {
            return null;
        }
    }
}
