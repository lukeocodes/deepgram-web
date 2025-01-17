(() => {
	function e(e, r) {
		return (
			(function (e) {
				if (Array.isArray(e)) return e;
			})(e) ||
			(function (e, t) {
				var r = null == e ? null : ("undefined" != typeof Symbol && e[Symbol.iterator]) || e["@@iterator"];
				if (null == r) return;
				var n,
					o,
					i = [],
					a = !0,
					u = !1;
				try {
					for (r = r.call(e); !(a = (n = r.next()).done) && (i.push(n.value), !t || i.length !== t); a = !0);
				} catch (e) {
					(u = !0), (o = e);
				} finally {
					try {
						a || null == r.return || r.return();
					} finally {
						if (u) throw o;
					}
				}
				return i;
			})(e, r) ||
			(function (e, r) {
				if (!e) return;
				if ("string" == typeof e) return t(e, r);
				var n = Object.prototype.toString.call(e).slice(8, -1);
				"Object" === n && e.constructor && (n = e.constructor.name);
				if ("Map" === n || "Set" === n) return Array.from(e);
				if ("Arguments" === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return t(e, r);
			})(e, r) ||
			(function () {
				throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
			})()
		);
	}
	function t(e, t) {
		(null == t || t > e.length) && (t = e.length);
		for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
		return n;
	}
	if (
		(document.addEventListener("click", function (e) {
			for (var t = e.target; t; ) {
				if ("A" === t.tagName && "#" === t.getAttribute("href")) return void e.preventDefault();
				t = t.parentElement;
			}
		}),
		document.addEventListener("submit", function (e) {
			e.preventDefault();
		}),
		"ResizeObserver" in window)
	)
		n();
	else {
		var r = document.createElement("script");
		(r.onload = function () {
			(window.ResizeObserver = window.ResizeObserver.ResizeObserver), n();
		}),
			(r.src = "https://unpkg.com/@juggle/resize-observer@3.3.0/lib/exports/resize-observer.umd.js"),
			document.head.appendChild(r);
	}
	function n() {
		new window.ResizeObserver(function (t) {
			var r,
				n = e(t, 1)[0];
			n.contentBoxSize ? (r = (Array.isArray(n.contentBoxSize) ? n.contentBoxSize[0] : n.contentBoxSize).blockSize) : (r = n.contentRect.height);
			r !== window.bodyHeight &&
				r > 0 &&
				((window.bodyHeight = r),
				window.parent.postMessage({
					type: "BODY_HEIGHT",
					name: window.name,
					height: r,
				}));
		}).observe(document.body);
	}
})();
