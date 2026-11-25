(() => {
  const stage = document.querySelector('.map-stage');
  const map = document.querySelector('#city-map');
  if (!stage || !map) return;

  // The map owns one-finger drags so they can pan the map instead of the page.
  stage.style.touchAction = 'none';
  map.style.touchAction = 'none';
  map.style.userSelect = 'none';
  map.style.webkitUserSelect = 'none';

  const pointers = new Map();
  let drag = null;
  let baseViewBox = null;
  let suppressClickUntil = 0;

  const readViewBox = () => {
    const box = map.viewBox.baseVal;
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  };
  const applyViewBox = box => {
    map.setAttribute('viewBox', `${box.x} ${box.y} ${box.width} ${box.height}`);
  };
  const clampAxis = (value, size, baseStart, baseSize) => {
    if (size >= baseSize) return baseStart + (baseSize - size) / 2;
    return Math.max(baseStart, Math.min(baseStart + baseSize - size, value));
  };
  const clampViewBox = box => ({
    ...box,
    x: clampAxis(box.x, box.width, baseViewBox.x, baseViewBox.width),
    y: clampAxis(box.y, box.height, baseViewBox.y, baseViewBox.height)
  });
  const isBaseView = box => baseViewBox &&
    Math.abs(box.x - baseViewBox.x) < 1 &&
    Math.abs(box.y - baseViewBox.y) < 1 &&
    Math.abs(box.width - baseViewBox.width) < 1 &&
    Math.abs(box.height - baseViewBox.height) < 1;
  const activeScroller = () => document.body.classList.contains('map-popout-open')
    ? document.querySelector('#map-popout-viewport')
    : stage;
  const rememberBaseViewBox = () => {
    if (!baseViewBox && map.childElementCount) baseViewBox = readViewBox();
  };

  const mapObserver = new MutationObserver(rememberBaseViewBox);
  mapObserver.observe(map, { childList: true, subtree: true, attributes: true, attributeFilter: ['viewBox'] });
  rememberBaseViewBox();

  document.addEventListener('click', event => {
    if (!event.target.closest('#map-fit, #map-popout-fit')) return;
    requestAnimationFrame(() => {
      baseViewBox = readViewBox();
      stage.scrollLeft = 0;
      stage.scrollTop = 0;
      const viewport = document.querySelector('#map-popout-viewport');
      if (viewport) {
        viewport.scrollLeft = 0;
        viewport.scrollTop = 0;
      }
    });
  }, true);

  stage.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('button')) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size !== 1) {
      drag = null;
      return;
    }
    const scroller = activeScroller();
    drag = {
      id: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startBox: readViewBox(),
      scroller,
      startScrollLeft: scroller?.scrollLeft ?? 0,
      startScrollTop: scroller?.scrollTop ?? 0,
      moved: false
    };
  }, { passive: true });

  stage.addEventListener('pointermove', event => {
    if (event.pointerType !== 'touch' || !pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size !== 1 || !drag || drag.id !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;
    drag.moved = true;
    event.preventDefault();
    const box = readViewBox();

    if (isBaseView(box) && drag.scroller &&
        (drag.scroller.scrollWidth > drag.scroller.clientWidth + 1 ||
         drag.scroller.scrollHeight > drag.scroller.clientHeight + 1)) {
      drag.scroller.scrollLeft = drag.startScrollLeft - dx;
      drag.scroller.scrollTop = drag.startScrollTop - dy;
    } else if (baseViewBox) {
      const rect = map.getBoundingClientRect();
      const scaleX = drag.startBox.width / Math.max(1, rect.width);
      const scaleY = drag.startBox.height / Math.max(1, rect.height);
      applyViewBox(clampViewBox({
        ...drag.startBox,
        x: drag.startBox.x - dx * scaleX,
        y: drag.startBox.y - dy * scaleY
      }));
    }
  }, { passive: false });

  const endPointer = event => {
    if (!pointers.has(event.pointerId)) return;
    if (drag?.id === event.pointerId && drag.moved) suppressClickUntil = Date.now() + 450;
    pointers.delete(event.pointerId);
    if (drag?.id === event.pointerId || pointers.size > 0) drag = null;
    stage.classList.remove('map-touch-dragging');
  };
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);
  stage.addEventListener('click', event => {
    if (Date.now() >= suppressClickUntil) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
