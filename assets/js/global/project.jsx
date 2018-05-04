'use strict';
$(document).ready(function($) {


	// Запрет на "hover" при скроллинге страницы
	// =========================================
	var body = document.body, timer;

	window.addEventListener('scroll', function() {
		clearTimeout(timer);
		if(!body.classList.contains('disable-hover')) {
			body.classList.add('disable-hover')
		}
		timer = setTimeout(function(){
			body.classList.remove('disable-hover')
		},300);
	}, false);



	// Плавающая форма
	// ===============
	var swim_form = {

		$form:      $('.add-book-form'),
		$body:      $('body'),
		$html:      $('html'),
		moveClass:  'add-book-form--move',
		defTop:     $('.book-module__form-container').offset().top-10,
		window:     $(window),

		init: function() {
			this.scroll(),
			this.window.on('scroll', function(){
				swim_form.scroll()
			}),
			this.window.on('resize', function(){
				swim_form.defTop = $('.book-module__form-container').offset().top-10
			})
		},

		scroll: function() {
			if (this.defTop - (this.$body.scrollTop() || this.$html.scrollTop()) <= 0)
				this.$form.addClass(this.moveClass)
			else
				this.$form.removeClass(this.moveClass)
		}

	}
	swim_form.init()




	var book_module = {

		// Переменные
		// ==========
		edit_key:         false,
		$book_list:       $('.book-list'),
		edit_text:        $('.book-list').data('edit-text'),
		delete_text:      $('.book-list').data('delete-text'),
		author_text:      $('.add-book-form__input[name="author"]').data('edit-text'),
		quantity_text:    $('.add-book-form__input[name="quantity"]').data('edit-text'),


		// Методы
		// ======
		init: function() {

			// Показ текущих элементов Localstorage
			this.show_items()

			// Валидация на форме
			this.validation_form()


			// Событие нажатия на кнопки действий
			this.$book_list.on('click', '.book-list__action', function(event) {
				event.preventDefault()

				let $self_parent = $(this).parents('.book-list__item')
				let obj_item = {
					name: $self_parent.find('.book-list__name').text(),
					year: $self_parent.find('.book-list__year').text(),
					author: $self_parent.find('.book-list__author').text(),
					quantity: $self_parent.find('.book-list__quantity').text()
				}

				if( $(this).hasClass('book-list__action--edit') )
					book_module.edit_item('start', obj_item)
				else
					book_module.delete_item( book_module.key_item(obj_item) )

			});


		},


		// Добавление элемента в список
		// ============================
		prepend_item: (obj_item, key_item) => {
			$('.book-list').prepend(`
				<article class="book-list__item" data-key="${key_item}">
					<div class="book-list__heading">
						<span class="book-list__name">${obj_item.name}</span>
						(<span class="book-list__year">${obj_item.year}</span>)
					</div>
					<div class="book-list__body">
						<div class="book-list__desc">${book_module.author_text}: <span class="book-list__author">${obj_item.author}</span></div>
						<div class="book-list__desc">${book_module.quantity_text}: <span class="book-list__quantity">${obj_item.quantity}</span></div>
					</div>
					<div class="book-list__actions">
						<button class="book-list__action book-list__action--edit" type="button" title="${book_module.edit_text}"></button>
						<button class="book-list__action book-list__action--delete" type="button" title="${book_module.delete_text}"></button>
					</div>
				</article>
			`)
		},


		// Очистка полей формы от значений
		// ===============================
		clear_fields_values: function() {
			$('.add-book-form__input').val('')
		},


		// Очистка полей формы от классов валидации
		// ========================================
		clear_fields_classes: function() {

			$('.add-book-form__field').each(function(index, el) {
				$(el).removeClass('has-error')
					.find('.add-book-form__input')
						.removeClass('error')
						.removeClass('valid')
						.removeAttr('style')
					.siblings('.help-block.error').remove()
			});

		},


		// Проверка количества элементов после завершения операций
		// =======================================================
		test_quantity: function() {
			if( $('.book-list__item').length > 0 ) {
				if( $('.book-list__none').length > 0 )
					$('.book-list__none').remove()
			} else {
				if( $('.book-list__none').length == 0 )
					this.$book_list.append('<div class="book-list__none">'+this.$book_list.data('none-text')+'</div>')
			}
		},


		// Собирание объекта данных с формы
		// ================================
		object_item: function() {
			return {
				name: $('.add-book-form__input[name="name"]').val(),
				year: $('.add-book-form__input[name="year"]').val(),
				author: $('.add-book-form__input[name="author"]').val(),
				quantity: $('.add-book-form__input[name="quantity"]').val()
			}
		},


		// Получение ключа объекта
		// =======================
		key_item: function(obj_item) {
			return `book__${obj_item.name}__${obj_item.year}`
		},


		// Валидация на форме
		// ==================
		validation_form: function() {

			var this_module = this

			$.validate({
				form: '#add_book_form',
				errorMessageClass: 'error',
				modules: 'date',
				onSuccess: function($form) {

					if( this_module.edit_key )
						this_module.edit_item( 'end', this_module.object_item() )
					else
						this_module.add_item( this_module.key_item(this_module.object_item()), this_module.object_item() )

				  	return false;
				}
			});


		},


		// Завершение редактирования
		// =========================
		end_edit: function() {
			this.clear_fields_values() // Очищаем поля от значений
			this.clear_fields_classes() // Очищаем поля от классов
			this.edit_key = false // Очищаем переменную редактируемого элемента
		},


		// Свечение нового(отредактированного) элемента
		// ============================================
		shining_item: function(key_item) {
			let $self = $(`.book-list__item[data-key="${key_item}"]`)
			$self.addClass('book-list__item--shine')
			setTimeout(function () {
				$self.removeClass('book-list__item--shine')
			}, 1500)
		},


		// Скролл до нового(отредактированного) элемента
		// =============================================
		scroll_to_item: function(key_item) {
			let top = $(`.book-list__item[data-key="${key_item}"]`).offset().top;
			$('body,html').animate({scrollTop: top-20}, 500);
		},


		// Показ текущих элементов Localstorage
		// ====================================
		show_items: function() {

			for (let key_item in localStorage) {
				if( key_item.indexOf("book__")==0 ){
					let obj_item = JSON.parse(localStorage.getItem(key_item))
					this.prepend_item(obj_item,key_item)
				}
			}

			this.test_quantity()

		},


		// Добавление нового элемента
		// ==========================
		add_item: function(key_item, obj_item) {

			this.clear_fields_values()
			this.clear_fields_classes()

			// Проверяем на повтор по ключу
			var repeat_key = false
			$('.book-list__item').each(function(index, el) {
				if(key_item==$(el).data('key')) {
					repeat_key = true
					return false
				}
			});

			// Добавляем в localStorage в любом случае
			let serial_item = JSON.stringify(obj_item)
			localStorage.setItem(key_item,serial_item)

			if(repeat_key)  {// Если это дубль

				// заменяем текущий
				var $self = $(`.book-list__item[data-key="${key_item}"]`)
				$self.find('.book-list__author').text(obj_item.author)
				$self.find('.book-list__quantity').text(obj_item.quantity)

			} else {// Если новый элемент

			    // добавляем в начало списка
				this.prepend_item(obj_item, key_item)

			}

			this.shining_item(key_item)
			this.scroll_to_item(key_item)
			this.test_quantity()

		},


		// Удаление элемента
		// =================
		delete_item: function(key_item) {

			localStorage.removeItem(key_item)
			$(`.book-list__item[data-key="${key_item}"]`).remove();

			// Если удаляем редактируемый в данный момент элемент
			if( this.edit_key == key_item ) {
				this.end_edit()
			}

			this.test_quantity()

		},

		edit_item: function(stage, obj_item) {

			$(`.book-list__item[data-key="${this.edit_key}"]`).removeClass('active')
			let this_key = this.key_item(obj_item)

			if(stage=="start") {// Если начинаем редактировать элемент

				if( this.edit_key == this_key ) {

					this.end_edit()

				} else {

					this.edit_key = this_key
					$(`.book-list__item[data-key="${this_key}"]`).addClass('active')

					$('.add-book-form__input[name="name"]').val(obj_item.name),
					$('.add-book-form__input[name="year"]').val(obj_item.year),
					$('.add-book-form__input[name="author"]').val(obj_item.author),
					$('.add-book-form__input[name="quantity"]').val(obj_item.quantity)

					this.clear_fields_classes()

				}

			} else {// Если заканчиваем редактировать элемент

				let $self = $(`.book-list__item[data-key="${this.edit_key}"]`)
				$self.find('.book-list__name').text(obj_item.name)
				$self.find('.book-list__year').text(obj_item.year)
				$self.find('.book-list__author').text(obj_item.author)
				$self.find('.book-list__quantity').text(obj_item.quantity)
				$self.attr('data-key', this_key )

				this.shining_item(this_key)
				this.scroll_to_item(this_key)
				this.end_edit()

			}

		}


	}
	book_module.init()


});